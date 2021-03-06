var module = (function() {
    var _contexts = {};

    function _create_context(label_id, from, to, options) {
        var context_id = (Math.random() * 10000).toFixed(0);
        
        _contexts[context_id] = {
            "id": context_id,
            "label_id": label_id,
            "from": from,
            "to": to,
            "options": options,
            "round": 1,
            "canceled": false
        }

        return _contexts[context_id];
    }

    function _animate(context) {
        var { label_id, from, to, options, canceled, round } = context;
        var interval = Math.max(options["interval"] || 0, 0.01);
        var step = options["step"] || 20;

        if (!canceled && round < step) {
            timeout(interval, function() {
                var number = from + ((to - from) / step) * round;

                _update_number(label_id, number, options);
                _animate(context);
            });

            context["round"] += 1;
        } else {
            timeout(interval, function() {
                _update_number(label_id, to, options);
            });
 
            delete _contexts[context["id"]];
        }
    }

    function _update_number(label_id, number, options) {
        view.object(label_id).property({
            "text": _format_amount(number, options)
        });
    }

    function _format_amount(number, options={}) {
        var decimals = options["decimals"] || 5;
        var text = number.toFixed(decimals);

        if (decimals > 0 && options["truncates-zero"]) {
            text = text.replace(/0+$/, "").replace(/\.$/, options["truncates-point"] ? "" : ".0");
        }

        if (options["format-with-commas"]) {
            var [ number, decimal ] = text.split(".");

            if (decimal) {
                text = [ number.replace(/\B(?=(\d{3})+(?!\d))/g, ","), decimal ].join(".");
            } else {
                text = number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        }

        return text;
    }

    return {
        animate: function(label_id, from, to, options) {
            var context = _create_context(label_id, from, to, options || {});

            _update_number(label_id, from, options || {});
            _animate(context);

            return context["id"];
        },

        cancel: function(context_id) {
            if (_contexts[context_id]) {
                _contexts[context_id]["canceled"] = true;
            }
        }
    }
})();

__MODULE__ = module;
