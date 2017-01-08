require('ts-node').register({
    fast:true,
    compilerOptions:{
        allowJs:true,
        inlineSourceMap:true
    }
});

require('./webServer');