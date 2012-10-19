#!/usr/bin/env node

var fs = require('fs');
var path = process.argv[2] || false;
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

if( path != false ) {
    walk( path, function(err, files) {
        if (err) return console.log( 'walk error: ', err );
        for( var i=0; i < files.length; i++ ) {
            (function() {
                var file = files[i];
                var buffer = fs.readFileSync(file);
                if( bufIsUTF8(buffer) ) {
                    var data = decoder.write(buffer), regex = false, count;
                    if( ccnt(data, "\r\r\n") > 0 ) {
                        count = ccnt(data, "\r\r\n");
                        regex = new RegExp( "\r\r\n", "g");
                    } else if( ccnt(data, "\r\n") > 0 ) {
                        count = ccnt(data, "\r\n");
                        regex = new RegExp( "\r\n", "g");
                    } else if( ccnt(data, "\r") > 0 ) {
                        count = ccnt(data, "\r");
                        regex = new RegExp( "\r", "g");
                    }
                    if( regex !== false ) {
                        fs.writeFileSync( file, data.replace(regex, "\n") );
                        console.log( file + ' has been fixed! ( ' + count + ' replacements )' );
                    } else {
                        console.log( file + ' looks good already!' )
                    }
                } else {
                    console.log( file + ' is a binary file!' );
                }
            })();
        }
    });
} else {
    console.log( 'ERROR! - You must provide a path as an argument!' );
}

function walk(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            if ( file.substr(0,1) == '.' ) return next();
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

function ccnt( str, chr ) {
    var regex = new RegExp(chr, "ig");
    return (str.match(regex)||[]).length
}

function dataIsAscii(buf) {
    var isAscii = true;
    for (var i=0, len=buf.length; i<len; i++) {
      if (buf[i] > 127) { console.log('not ascii, found : ' + buf[i]); isAscii=false; break; }
    }
    return isAscii; // true iff all octets are in [0, 127].
}

function bufIsUTF8(buf) {
    // Prepare
    var contentStartUTF8 = buf.toString('utf8',0,24),
        isUtf8 = true;

    // Detect encoding
    for( var i=0, len=contentStartUTF8.length; i<len; i++ ) {
        var charCode = contentStartUTF8.charCodeAt(i);
        if( charCode == 65533 || charCode <= 8 ) {
            // 8 and below are control characters (e.g. backspace, null, eof, etc.)
            // 65533 is the unknown character
            isUtf8 = false;
            break;
        }
    }

    // Return encoding
    return isUtf8
}