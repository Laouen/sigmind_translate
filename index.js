var data = {};
var current_key = undefined;
var current_en_text = '';
var keys = [];

const sep = '|';
const max_charcarters = 30;

function update_en_text(event) {
    current_en_text = event.target.value;
}

function set_new_text() {
    if (current_en_text !== undefined) {
        data[current_key]['Inglés'] = current_en_text;

        var en_text = current_en_text;
        if (current_en_text.length > max_charcarters) {
            en_text = en_text.slice(0, max_charcarters) + '...';
        }

        $('#' + current_key + '-en').html(en_text);
    }
};

function update_current_data(key) {
    return function() {
        $('#' + current_key).removeClass('active');
        $('#' + key).addClass('active');
        current_key = key;
        current_en_text = data[key]['Inglés'];

        $('#data_key').html(key);
        $('#data_text_es').text(data[key]['Español']);
        $('#data_text_en').val(data[key]['Inglés'] || '');
    };
}



function fill_sidebar_list(content) {
    var content_div = $('#content_list');
    content_div.empty();

    keys = Object.keys(content);
    for (var i = 0; i < keys.length; i++) {

        item = content[keys[i]];

        var a = $("<a id='" + keys[i] + "' href='#' class='list-group-item list-group-item-action py-3 lh-tight'></a>");
        var div = $("<div class='d-flex w-100 align-items-center justify-content-between'></div>");
        div.append("<strong class='mb-1' style='word-break: break-word;'>" + keys[i] + "</strong>");
        a.append(div);

        var text_es = item['Español']
        if (text_es.length > max_charcarters) {
            text_es = text_es.slice(0, max_charcarters) + '...'
        }

        a.append("<div class='col-10 mb-1 small'>" + text_es + "</div>");

        if (current_key === keys[i]) {
            a.addClass('active');
        }

        var text_en = item['Inglés'] || '';
        if (text_en.length > max_charcarters) {
            text_en = text_en.slice(0, max_charcarters) + '...'
        }

        a.append("<div id='" + keys[i] + "-en' class='col-10 mb-1 small'>" + text_en + "</div>");

        a.click(update_current_data(keys[i]));
        
        content_div.append(a);
    }
}

function csv2json(filecontent) {
    
    var lines = filecontent.split('\n');
    var headers = lines[0].split(sep);

    var entries = {};
    for (var i = 1; i < lines.length; i++) {
        
        var current_line = lines[i].split(sep);
        var line_data = {}
        for (var j = 0; j < headers.length; j++) {
            line_data[headers[j]] = current_line[j];
        }

        // Por si hay un character de separacion en el texto que termine dividiendo el texto
        for (var j = headers.length; j < current_line.length; j++) {
            console.log(line_data['content_key']);
            line_data[headers[headers.length-1]] += current_line[j];
        }
        
        if (['Español', 'Inglés'].indexOf(line_data['language']) < 0) {
            continue;
        }

        if (entries[line_data['content_key']] === undefined) {
            entries[line_data['content_key']] = {is_list: false};
        }

        entries[line_data['content_key']][line_data['language']] = line_data['text'];
        is_list = JSON.parse(entries[line_data['content_key']]['is_list']);
        entries[line_data['content_key']]['is_list'] = is_list || line_data['is_list'];
    }



    return entries;
}

function new_input_model(evt) {
    var reader = new FileReader();
    reader.onload = function () {
        evt.target.value = "";
        data = csv2json(reader.result);
        current_key = Object.keys(data)[0];
        console.log(data);
        fill_sidebar_list(data);
        update_current_data(current_key)();
        $('#btn-export').prop('disabled', false);
        $('#edit_content').css('display', 'flex');
    };
    reader.readAsText(evt.target.files[0]);
}

function export_data() {
    var rows = ['content_key|is_list|locale|language|text\n'];

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        rows.push([
            key,
            data[key]['is_list'] ? 'true' : 'false',
            '',
            'Inglés',
            data[key]['Inglés']
        ].join(sep) + '\n');

        rows.push([
            key,
            data[key]['is_list'] ? 'true' : 'false',
            '',
            'Español',
            data[key]['Español']
        ].join(sep) + '\n');
    }

    var blob = new Blob(rows, { type: 'text/csv;charset=utf-8;' });

    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, 'content_en.csv');
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", 'content_en.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // key up
        idx = keys.findIndex((a) => a === current_key);
        idx = Math.max(idx-1, 0);
        console.log(idx, keys[idx]);
        update_current_data(keys[idx])();
    } else if (e.keyCode == '40') {
        // key down
        idx = keys.findIndex((a) => a === current_key);
        idx = Math.min(idx + 1, keys.length - 1);
        console.log(idx, keys[idx]);
        update_current_data(keys[idx])();
    }

}

document.onkeydown = checkKey;