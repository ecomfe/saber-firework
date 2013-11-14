/**
 * @file  esl模板插件
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var ajax = require('saber-ajax');

    var SPLIT_TOKEN = '-TPL-SPLIT-';

    function getTpl(str) {
        var tpl = {};
        var keys = [];
        str = str.replace(/<!--(.+)-->/g, function ($0, $1) {
            var res;

            $1 = $1.trim(); 
            if ($1.indexOf('name:') === 0) {
                $1 = $1.replace(/name:\s*/, '');
                keys.push($1);
                res = SPLIT_TOKEN;
            }
            else {
                res = $0;
            }

            return res;
        });

        str = str.split(SPLIT_TOKEN);

        keys.forEach(function (key, index) {
            tpl[key] = str[index + 1] || '';
        });

        return tpl;
    }

    return {
        load: function (resourceId, require, load, config) {
            var url = require.toUrl(resourceId);

            var t = 'req=' + (new Date()).getTime();
            if (url.indexOf('?') >= 0) {
                url += '&' + t;
            }
            else {
                url += '?' + t;
            }

            ajax.get(url).then(function (res) {
                load(getTpl(res));
            });
        }
    };
});
