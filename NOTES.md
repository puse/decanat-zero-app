ajax
====

(reuse: positronic)

`ajax` [function] 
-----------------

`module.exports = ajax`

```
ajax(<url>, {options}, [callback]);
ajax('/users/', {})
```


`Request` [constructor] 
-----------------------

`module.exports.Request = Request`

(check: superagent)




router
======

(reuse: page)
(use: qs, )

`page` [function]
-----------------

`module.exports = page`

```
page(<route>, [callback]);
page('/users/:id', parseUser);
```



------------------------------------------------


1. how to document usage of `.use` like:
    - route middleware - `.use(function(ctx, scn, next){ .. })` 
    - plugin - 
    `.use({ a: 1, __decanat: function(app){ app.a = this.a * 4; } })` 

    ```
        function MyPlugin(){
            var hash = Math.random() * 1000 | 0;
            return {
                __decanat: function(app) {
                    app.getToken = function(){
                        var token = 't:'+
                        return 't:' +
                    }; // returns 't:'
                }
            }
        };
    ```
