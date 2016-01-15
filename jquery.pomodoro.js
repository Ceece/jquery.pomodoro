(function($) {
    $.fn.pomodoro = function(options) {
        var $element = $(this);
        var self = this;
        var settings = $.extend({
            template: '{{text}}: {{clock}}',
            session: 25,
            break: 5
        }, options);

        self.init = function() {
            self.reset();
            $element.click(function(event) {
                if (self.pomodoro.__pause)
                    self.start();
                else
                    self.pause();
            });

            $(settings.session).change(function(event) {
                self.reset();
            });

            $(settings.break).change(function(event) {
                self.reset();
            });
        };

        self.reset = function() {
            var session_time = typeof settings.session == "string" && $(settings.session) ? parseInt( $(settings.session).val() ) : settings.session;
            var break_time = typeof settings.break == "string" && $(settings.break) ? parseInt( $(settings.break).val() ) : settings.break;

            self.pomodoro = {
                timer: session_time * 60,
                session: session_time * 60,
                break: break_time * 60,
                __phase: "session",
                __pause: true
            };
            self.render();
        }

        self.tick = function() {
            self.pomodoro.timer--;
            self.render();
            if (settings.tick)
                settings.tick(self.pomodoro);

            setTimeout(function() {
                if (self.pomodoro.timer == 0)
                    self.timeout();
                else if (self.pomodoro.__pause !== true)
                    self.tick();
            }, 1000);
        };

        self.start = function() {
            self.pomodoro.__pause = false;
            self.tick();
        };

        self.pause = function() {
            self.pomodoro.__pause = true;
        };

        self.resume = self.start;

        self.timeout = function() {
            if (settings.timeout)
                settings.timeout(self.pomodoro);

            if (self.pomodoro.__phase == "session") {
                self.pomodoro.__phase = "break";
                self.pomodoro.timer = self.pomodoro.break;
                self.render();
                setTimeout(function() {
                    self.tick();
                }, 1000);
            } else {
                self.reset();
                setTimeout(function() {
                    self.start();
                }, 1000);
            }
        }

        self.render = function() {
            var pad = "00";
            var sec = self.pomodoro.timer % 60 + "";
            var min = Math.floor(self.pomodoro.timer / 60) + "";

            var colon = sec % 2 == 0 ? ':' : " ";

            sec = pad.substring(0, pad.length - sec.length) + sec;
            min = pad.substring(0, pad.length - min.length) + min;

            var clock = min + colon + sec;
            var text = self.pomodoro.__phase.toUpperCase();
            var html = settings.template.replace(/\{\{clock\}\}/g, clock).replace(/\{\{text\}\}/g, text);
            $element.html(html);
        }

        self.percentage = function() {
            var percentage = self.pomodoro.timer / self.pomodoro[self.pomodoro.__phase] * 100;
            if (self.pomodoro.__phase == "session")
                return 100 - percentage;
            return percentage;
        }

        self.init();
        return this;
    };

}(jQuery));