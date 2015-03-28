Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

Array.prototype.shuffle = function() {
    for (var i = this.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
}

Array.prototype.unserialize = function(data) {
    // Custom Function to unserialize PHP array
    //  discuss at: http://phpjs.org/functions/unserialize/
    //  original by: Arpad Ray (mailto:arpad@php.net)
    //  note: We feel the main purpose of this function should be to ease the transport of data between php & js
    //  note: Aiming for PHP-compatibility, we have to translate objects to arrays

    var that = this,
    utf8Overhead = function(chr) {
    // http://phpjs.org/functions/unserialize:571#comment_95906
    var code = chr.charCodeAt(0);
    if (code < 0x0080) {
        return 0;
    }
    if (code < 0x0800) {
        return 1;
    }
    return 2;
    };
    error = function(type, msg, filename, line) {
        throw new that.window[type](msg, filename, line);
    };
    read_until = function(data, offset, stopchr) {
        var i = 2,
        buf = [],
        chr = data.slice(offset, offset + 1);

        while (chr != stopchr) {
            if ((i + offset) > data.length) {
                error('Error', 'Invalid');
            }
            buf.push(chr);
            chr = data.slice(offset + (i - 1), offset + i);
            i += 1;
        }
        return [buf.length, buf.join('')];
    };
    read_chrs = function(data, offset, length) {
        var i, chr, buf;

        buf = [];
        for (i = 0; i < length; i++) {
            chr = data.slice(offset + (i - 1), offset + i);
            buf.push(chr);
            length -= utf8Overhead(chr);
        }
        return [buf.length, buf.join('')];
    };
    _unserialize = function(data, offset) {
        var dtype, dataoffset, keyandchrs, keys, contig,
        length, array, readdata, readData, ccount,
        stringlength, i, key, kprops, kchrs, vprops,
        vchrs, value, chrs = 0,
        typeconvert = function(x) {
            return x;
        };

        if (!offset) {
            offset = 0;
        }
        dtype = (data.slice(offset, offset + 1))
        .toLowerCase();

        dataoffset = offset + 2;

        switch (dtype) {
            case 'i':
            typeconvert = function(x) {
                return parseInt(x, 10);
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
            case 'b':
            typeconvert = function(x) {
                return parseInt(x, 10) !== 0;
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
            case 'd':
            typeconvert = function(x) {
                return parseFloat(x);
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
            case 'n':
            readdata = null;
            break;
            case 's':
            ccount = read_until(data, dataoffset, ':');
            chrs = ccount[0];
            stringlength = ccount[1];
            dataoffset += chrs + 2;

            readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 2;
            if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
                error('SyntaxError', 'String length mismatch');
            }
            break;
            case 'a':
            readdata = {};

            keyandchrs = read_until(data, dataoffset, ':');
            chrs = keyandchrs[0];
            keys = keyandchrs[1];
            dataoffset += chrs + 2;

            length = parseInt(keys, 10);
            contig = true;

            for (i = 0; i < length; i++) {
                kprops = _unserialize(data, dataoffset);
                kchrs = kprops[1];
                key = kprops[2];
                dataoffset += kchrs;

                vprops = _unserialize(data, dataoffset);
                vchrs = vprops[1];
                value = vprops[2];
                dataoffset += vchrs;

                if (key !== i)
                    contig = false;

                readdata[key] = value;
            }

            if (contig) {
                array = new Array(length);
                for (i = 0; i < length; i++)
                    array[i] = readdata[i];
                readdata = array;
            }

            dataoffset += 1;
            break;
            default:
            error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
            break;
        }
        return [dtype, dataoffset - offset, typeconvert(readdata)];
    };

    return _unserialize((data + ''), 0)[2];
}

String.prototype.replaceAll = function(sub, str) {
    // Replace first found instance of sub w/ str
    var temp = this.replace(sub, str);
    // Check for remaining instances
    if (temp.indexOf(sub) !== -1) {
        // Recursively call self if instances of sub remain
        return temp.replaceAll(sub, str);
    } else {
        // Else return string
        return temp;
    }
}

String.prototype.firstWord = function(){
    return this.trim().split(" ")[0] || '';
}