var context = require.context('./test', true, /Test$/);
context.keys().forEach(context);