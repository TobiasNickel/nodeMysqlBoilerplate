
import * as Koa from 'koa';
import * as route from 'koa-route';
import * as _ from 'underscore';
import * as db from './mysqlDB';

/**
 * 
 * 
 * @param {any} input
 * @returns
 */
var defaultFilter = async function (input) { return input; };

const m = module.exports;
/**
 * 
 * 
 * @param {any} dao
 * @param {any} options
 * @returns
 */
m.daoToRestRouter = function (dao, options) {
    var router = new Koa();

    const inputFilter = options.inputFilter || defaultFilter;
    const outputFilter = options.outputFilter || defaultFilter;
    const maxPageSize = parseInt(options.maxPageSize) || 10;
    const defaultPageSize = options.pageSize || 10;
    const searchableFields = options.searchableFields || ['id'];
    const fulltextFields = options.fillTextFields || searchableFields;
    const allowChangesOnGet = (options.allowChangesOnGet !== undefined) ? !!options.changeOnGet : true;

    /**
     * 
     * 
     * @param {any} ctx
     */
    const createHandler = async function (ctx) {
        const newItem = _.extend({}, ctx.query, ctx.req.body);
        const validatedItem = await inputFilter(ctx, newItem);
        if (validatedItem) {
            const id = await dao.insert(validatedItem);
            const item = await dao.getOneById(id);
            ctx.body = await outputFilter(ctx, item);
        } else {
            ctx.body = false;
        }
    };

    /**
     * 
     * 
     * @param {any} ctx
     * @param {any} id
     * @returns
     */
    const deleteHandler = async function (ctx, id) {
        if(_.isNaN(parseInt(id))){
            ctx.body = false;
            return;
        }
        const item = await dao.getOneById(id);
        if (!item) {
            ctx.body = true;
            return;
        }
        const shouldDelete = await inputFilter(ctx, undefined, item);
        if (shouldDelete) {
            ctx.body = await dao.deleteById(id);
        } else {
            ctx.body = false;
        }
    };

    /**
     * 
     * 
     * @param {any} ctx
     * @param {String} id
     */
    const getByIdHandler = async function (ctx, id) {
        if(_.isNaN(parseInt(id))){
            ctx.body = false;
            return;
        }
        const item = await dao.getOneById(parseInt(id));
        if (item) {
            ctx.body = await outputFilter(ctx, item);
        } else {
            ctx.body = false;
        }
    };

    const updateHandler = async function(ctx,id){
        if(_.isNaN(parseInt(id))){
            ctx.body = false;
            return;
        }
        const updates = _.extend({id:id}, ctx.query, ctx.req.body);
        var item = await dao.getOneById(id);
        if(!item){
            ctx.body = false;
            return;
        }
        const updateSet = await inputFilter(ctx,updates, item);
        if(!updateSet){
            ctx.body = false;
            return;
        }
        const keys = Object.keys(updateSet);
        if(keys.length>1){
            await dao.saveOne(updateSet)
        }
        ctx.body = true;
    };

    const searchHandler = async function (ctx) {
        const query = ctx.query;
        const keys = Object.keys(query);
        const params = {};
        var queryProps = [];
        keys.forEach(function (key) {
            if (key[0] === '_') {
                params[key] = query[key];
            } else {
                queryProps.push(key);

            }
        });
        var pageSize = parseInt(params._pageSize) || defaultPageSize;
        if (pageSize > maxPageSize) {
            pageSize = maxPageSize;
        }
        var page = parseInt(params._page) || 0;
        var items = [];
        if (!queryProps.length) {
            //get all
            items = await dao.getAll(page, pageSize);
        } else {
            if (queryProps.length === 1 && queryProps[0] === 'q') {
                // todo: fulltext
                const searchString = '%' + query.q + '%';
                const where = [];
                const params = [];
                fulltextFields.forEach(function (propName) {
                    where.push(propName + ' LIKE ? ');
                    params.push(searchString);
                });
                items = await dao.where(where.join(' OR '), params, page, pageSize);
            } else {
                //property filter
                queryProps = _.intersection(queryProps, searchableFields);
                if (queryProps.length) {
                    const where = [];
                    const params = [];
                    queryProps.forEach(function (propName) {
                        const value = query[propName];
                        const indicator = value[0];
                        if (indicator === '>') {
                            where.push(propName + ' > ?');
                            params.push(value.substr(1));
                        } else if (indicator === '<') {
                            where.push(propName + ' < ?');
                            params.push(value.substr(1));
                        } else if (indicator === '!') {
                            where.push(propName + ' <> ?');
                            params.push(value.substr(1));
                        } else {
                            where.push(propName + ' = ?');
                            params.push(value);
                        }
                    });
                    //items = await dao.findWhere(queryPropValues, page, pageSize);
                    items = await dao.where(where.join(' AND '), params, page, pageSize);
                } else {
                    ctx.body = { message: 'no allowed parameter' };
                    return;
                }
            }
        }
        const output = [];
        for (var item of items) {
            let out = await outputFilter(ctx, item);
            if (out) output.push(out);
        }

        ctx.body = {
            items: output,
            count: output.length,
            resultCount: items.resultCount,
            pageCount: items.pageCount
        };
    };
    if(allowChangesOnGet){
        router.use(route.get('/create', createHandler));
        router.use(route.get('/delete/:id', deleteHandler));
        router.use(route.get('/update/:id', updateHandler))
    }
    router.use(route.post('/', createHandler));
    router.use(route.delete('/:id', deleteHandler));
    router.use(route.put('/:id',updateHandler));
    router.use(route.get('/:id', getByIdHandler));
    router.use(route.get('/', searchHandler));

    return router;
};

m.transactionMiddleware = function () {
    return async function (ctx, next) {
        var connection = await db.beginTransaction();
        try {
            ctx.connection = connection;
            //await db.save({id:'1',obj:'data'}, connection);
            await next();
            await connection.commit();
        } catch (e) {
            await connection.rollback();
        }
    };
};