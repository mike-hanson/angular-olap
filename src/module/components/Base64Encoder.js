(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});
    olap.Base64Encoder = function () {
        var self = this;
        var paddingCharacter = '=';
        var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        self.encode = function (str) {
            if (window.btoa) {
                return window.btoa(str);
            }

            if (!str) {
                throw new Error('A string to encode is required by olap.Base64Encoder.encode.')
            }

            var  byte;
            var result = [];

            str = '' + str;

            var maxLength = str.length - str.length % 3;

            if (str.length == 0) {
                return str;
            }
            for (var i = 0; i < maxLength; i += 3) {
                byte = (getByte(str, i) << 16) | (getByte(str, i + 1) << 8) | getByte(str, i + 2);
                result.push(alpha.charAt(byte >> 18));
                result.push(alpha.charAt((byte >> 12) & 0x3F));
                result.push(alpha.charAt((byte >> 6) & 0x3f));
                result.push(alpha.charAt(byte & 0x3f));
            }
            switch (str.length - maxLength) {
                case 1:
                    byte = getByte(str, i) << 16;
                    result.push(alpha.charAt(byte >> 18) + alpha.charAt((byte >> 12) & 0x3F) +
                        paddingCharacter + paddingCharacter);
                    break;
                case 2:
                    byte = (getByte(str, i) << 16) | (getByte(str, i + 1) << 8);
                    result.push(alpha.charAt(byte >> 18) + alpha.charAt((byte >> 12) & 0x3F) +
                        alpha.charAt((byte >> 6) & 0x3f) + paddingCharacter);
                    break;
            }
            return result.join('');
        };

        function getByte(str, index) {
            var character = str.charCodeAt(index);
            if (character > 255) {
                throw new Error("INVALID_CHARACTER_ERR: DOM Exception 5");
            }
            return character;
        }
    }
})(window);