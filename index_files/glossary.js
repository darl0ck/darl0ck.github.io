// объект-простанство имен
function GlossaryNS() {
    this.text = "";
    this.found_ids = new Array();
    this.view_pos = 0;
    this.button_clicked = false;
    this.mouse_x_prev;
    this.mouse_y_prev;
    this.abc_panel = null;
    this.abc_glossary_ids;
    this.glossary_terms;
}

GlossaryNS.prototype.initPage = function() {
    var self = this;

    jQuery("#control_panel #view_found").hide();

    jQuery("#currentTask").mousedown(function() {
        jQuery("#search_in_glossary").remove();
    });

    jQuery("#currentTask").mouseup(function(e) {
        self.slideDownFindTip(e);
    });
    
    $('#glossaryScreenButton').click(function () {
        jQuery("#view_all").click();
        jQuery("#control_panel #view_found").hide();
        jQuery('#search_input').val();
        self.showGlossaryScreen();
    });

    $('#glossaryScreen .b-window-close').click(function () {
        $("#splashScreen").fadeTo(400, 0).hide();
        $('#glossaryScreen').hide();            
    });

    jQuery("#view_all").click(function() {
        jQuery('li[id^="term_li_"]').show();
    });

    jQuery("#view_found").click(function() {
        self.viewTerms(self.found_ids);
    });

    jQuery("#glossary_close").click(function() {
        if (self.abc_panel != null) self.abc_panel.close();
        jQuery("#glossaryScreen").fadeTo("fast", 0);
        jQuery("#glossaryScreen").hide();
        jQuery("#main_holder_tt").css('opacity', 1);
    });

    // autocomplete
    jQuery("#search_input").keydown(function(e) {
        var input = this;
        if (self.inputSelect == undefined) {
            self.inputSelect = new inputSelect("search_input", "search_input_autocomplete", function() {jQuery("#search_sumbit").click()});
        }
        setTimeout(function() {
            if (!self.filteredKeys(e.keyCode)) {
                jQuery(input).css('background', '#fff');
                jQuery(input).css('color', '#000');
                var found_terms = self.searchInGlossaryStrict(input.value);
                if (found_terms.length > 0 && input.value != '') {
                    self.inputSelect.show(found_terms);
                } else {
                    self.inputSelect.close();
                }
            }
        }, 100);
    });

    jQuery("#search_sumbit").click(function() {
        var pos = jQuery("#search_input").position();
        jQuery("#search_panel #loading").css('top', pos.top + parseInt(jQuery("#search_input").height()));
        jQuery("#search_panel #loading").css('left',pos.left + 4);
        jQuery("#search_panel #loading").show();
        var gs_cursor = jQuery("#glossaryScreen").css('cursor');
        var si_cursor = jQuery("#search_input").css('cursor');
        var ss_cursor = jQuery("#search_sumbit").css('cursor');
        jQuery("#glossaryScreen").css('cursor', 'wait');
        jQuery("#search_input").css('cursor', 'wait');
        jQuery("#search_sumbit").css('cursor', 'wait');
        setTimeout(function() {
            self.ajaxSearchInGlossary(jQuery("#search_input").val(), function(data, status) {
                var json = data;
                jQuery("#search_panel #loading").hide();
                jQuery("#glossaryScreen").css('cursor', gs_cursor);
                jQuery("#search_input").css('cursor', si_cursor);
                jQuery("#search_sumbit").css('cursor', ss_cursor);
                if (json.message.length > 0) {
                    self.found_ids = json.message;
                    jQuery("#control_panel #view_found").show();
                    jQuery("#view_found").click();

                } else {
                    jQuery("#search_input").css('background', '#ff7e7e');
                    jQuery("#search_input").css('color', '#fff');
                }
            });
        }, 1000);
    });

    jQuery("#abc_panel_open").click(function(e) {
        if (self.abc_panel == null) self.abc_panel = new panelWindow;
        var z_index = parseInt(jQuery("#glossaryScreen").css("z-index"));
        z_index = (z_index == 'NaN') ? 99 : z_index+1;
        self.abc_panel.top = e.pageY;
        self.abc_panel.left = e.pageX;
        self.abc_panel.z_index = z_index;
        self.abc_panel.background = 'white';
        self.abc_panel.id = "abc_panel";

        setTimeout(function() {
            if (typeof(jQuery('#glossaryScreen').data('setEvent')) == 'undefined') {
                jQuery('#glossaryScreen').click(function(e) {
                    jQuery(this).data('setEvent', true);
                    var parents = jQuery(e.target).parents();
                    var length = parents.length;
                    var found = false;
                    for (var i = 0; i < length; i++) {
                        if (parents[i].id == 'abc_panel') {
                            found = true; break;
                        }
                    }
                    if (!found) {
                        self.abc_panel.close();
                    }
                });
            }
        }, 1000); // через промежуток времени навешиваем событие.
        self.abc_panel.show(self.formTable());
        jQuery("a[id^='letter_link_']").click(function() {
            var letter = this.id.replace('letter_link_', '');
            self.goLetter(letter);
            self.abc_panel.close();
        });
    });
}

GlossaryNS.prototype.dropDown = function(list) {
    jQuery("#search_input");
}

GlossaryNS.prototype.searchInGlossaryStrict = function(text) {
    var self = this;
    var terms;
    var found_terms = new Object();
    found_terms.length = 0;
    if (text != '') {
        terms = self.glossary_terms[text.charAt(0).toLowerCase()];
        if (typeof (terms) != "undefined") {
            jQuery.each(terms, function(id, term) {
                var term_l = term.toLowerCase();
                var text_l = text.toLowerCase();
                var mask = new RegExp("^"+encodeURIComponent(text_l)+".*$");
                if (encodeURIComponent(term_l).match(mask)) {		// если не совпалось - то удаляем из словаря
                    found_terms[id] = term;
                    found_terms.length++;
                }
            });
        }
    }

    return found_terms;
}

// Формируется таблица букв русского алфавита
GlossaryNS.prototype.formTable = function() {
    var self = this;
    return "<table>" +
                    "<tr>" +
                    "<td>"+self.writeLetter('А')+"</td>" +
                    "<td>"+self.writeLetter('Б')+"</td>" +
                    "<td>"+self.writeLetter('В')+"</td>" +
                    "<td>"+self.writeLetter('Г')+"</td>" +
                    "<td>"+self.writeLetter('Д')+"</td>" +
                    "<td>"+self.writeLetter('Е')+"</td>" +
                    "<td>"+self.writeLetter('Ё')+"</td>" +
                    "<td>"+self.writeLetter('Ж')+"</td>" +
                    "<td>"+self.writeLetter('З')+"</td>" +
                    "<td>"+self.writeLetter('И')+"</td>" +
                    "<td>"+self.writeLetter('Й')+"</td>" +
                    "<td>"+self.writeLetter('К')+"</td>" +
                    "<td>"+self.writeLetter('Л')+"</td>" +
                    "<td>"+self.writeLetter('М')+"</td>" +
                    "<td>"+self.writeLetter('Н')+"</td>" +
            "</tr>" +
            "<tr>" +
                    "<td>"+self.writeLetter('О')+"</td>" +
                    "<td>"+self.writeLetter('П')+"</td>" +
                    "<td>"+self.writeLetter('Р')+"</td>" +
                    "<td>"+self.writeLetter('С')+"</td>" +
                    "<td>"+self.writeLetter('Т')+"</td>" +
                    "<td>"+self.writeLetter('У')+"</td>" +
                    "<td>"+self.writeLetter('Ф')+"</td>" +
                    "<td>"+self.writeLetter('Х')+"</td>" +
                    "<td>"+self.writeLetter('Ц')+"</td>" +
                    "<td>"+self.writeLetter('Ч')+"</td>" +
                    "<td>"+self.writeLetter('Ш')+"</td>" +
                    "<td>"+self.writeLetter('Щ')+"</td>" +
                    "<td>"+self.writeLetter('Э')+"</td>" +
                    "<td>"+self.writeLetter('Ю')+"</td>" +
                    "<td>"+self.writeLetter('Я')+"</td>" +
            "</tr>" +
            "</table>";
}

// Переход по букве к терминам на эту букву
GlossaryNS.prototype.goLetter = function(letter) {
    var self = this;
    var items = self.abc_glossary_ids[letter];
    if (typeof(items) != "undefined") { self.viewTerms(items); }
}

// Показать только те термины, которые в массиве 
GlossaryNS.prototype.viewTerms = function(terms_ids) {
    var _terms_ids = terms_ids.slice();
    jQuery('li[id^="term_li_"]').each(function() {
        var found = false;
        for (var i = 0; i < _terms_ids.length; i++) {
            if (this.id == 'term_li_'+_terms_ids[i]) {
                found = true;
                _terms_ids.splice(i, 1);
                break;
            }
        }
        if (!found) {  jQuery(this).hide();  } else { jQuery(this).show() }
    });
}

// Выводим букву, либо ссылку-действие по этой букве
GlossaryNS.prototype.writeLetter = function(letter) {
    var html;
    var self = this;
    var letter_low = letter.toLowerCase();
    var items = self.abc_glossary_ids[letter_low];
    if (typeof(items) != "undefined") {
        html = "<a href='javascript: void(0);' id='letter_link_"+letter_low+"'>"+letter+"</a>";
    } else {
        html = letter;
    }
    return html;
}

// Всплывает вниз tip с кнопкой 'Найти в справочнике' 
GlossaryNS.prototype.slideDownFindTip = function(e) {
    var self = this;
    self.text = self.getSelText();		// запоминаем выделенный текст
    if (self.text.length > 0) {
        var tip = new Tip(e.pageX, e.pageY, 'search_in_glossary');
        jQuery("body").prepend(tip.start+"Найти в справочнике"+tip.end);
        jQuery("#search_in_glossary").slideDown("fast");
        jQuery("#search_in_glossary").click(function() {
            self.ajaxSearchInGlossary(self.text, function(data, textStatus) {
                var json = data;
                if (json.message.length > 0) {
                    self.found_ids = json.message;
                    jQuery("#control_panel #view_found").show();
                    jQuery("#view_found").click();
                    jQuery("#search_input").val(self.text);
                    self.showGlossaryScreen();
                } else {
                    alert('К сожалению, ни одного соответствия не найдено');
                }
            });
            jQuery(this).remove();
        });
        jQuery("#glossary_close").click(function() {
            jQuery("#search_in_glossary").remove();
        });
    } else {
        jQuery("#search_in_glossary").remove();
    }
} 

// Возвращаем текст выделения
GlossaryNS.prototype.getSelText = function() {
    var txt = '';
    if (window.getSelection) {
        txt = window.getSelection().toString();
    } else if (document.getSelection) {
        txt = document.getSelection().toString();
    } else if (document.selection) {
        txt = document.selection.createRange().text;
    }
    return txt;
}

// Отображение экрана тезауруса
GlossaryNS.prototype.showGlossaryScreen = function() {
    $("#splashScreen").fadeTo(400, 0.7).show();
    $('#glossaryScreen').show();
}


// Ajax - поиск текста в тезаурусе
GlossaryNS.prototype.ajaxSearchInGlossary = function(text, fn) {
    var self = this;
    jQuery.ajax({
        type : "POST",
        url  : window.location,
        data : {action: "searchInGlossary", text: decodeURI(text)},
        success : fn
    });
}

// коды символов, которые имеют управляющее свойство
GlossaryNS.prototype.filteredKeys = function(keyCode) {
    return (keyCode==null) || (keyCode==0) || (keyCode==9) || (keyCode==13) || (keyCode==27) || (keyCode==40) || (keyCode==38) || (keyCode==39) || (keyCode==37);
}

// Конструктор класса tip - всплывающее оскно
function Tip(x, y, id) {
    this.start = "<input id='"+id+"' type='button' " +
            "style='display: none; background: white; position: absolute; font-size: 12px; border: 1px solid black;" +
                    "z-index: 2; left: "+x+"px; top: "+y+"px;' value='";
    this.end = "' />";
}

/* PANEL WINDOW CLASS */
// Конструктор класса panelWindow - окно-панелька (например для таблицы с буквами)
function panelWindow() {
    this.top = 0;
    this.left = 0;
    this.background;
    this.z_index = 0;
    this.id;
    this.width = 250;
}

// отобразить панельку
panelWindow.prototype.show = function(body) {
    var self = this;
    if (typeof(jQuery("#"+self.id).get(0)) == "undefined") {
        var html = "<div id='"+self.id+"' style='position: absolute; top: "+self.top+"; left: "+self.left+"; z-index: "+self.z_index+"; background: "+self.background+"; width: "+self.width+"; border: 1px solid grey; display: none;'>";
        html += "<img id='"+self.id+"_close' style='float: right;' height='8' width='8' alt='X' class='button' src='images/tt/close.gif' />"
        html += body;
        html += "</div>";
        jQuery("body").prepend(html);
        jQuery("#"+self.id).slideDown("fast");
        jQuery("#"+self.id+"_close").click(function() {
                jQuery("#"+self.id).slideUp("fast");
        });
    } else {
        jQuery("#"+self.id).slideDown("fast");
    }
}

// скрыть панельку
panelWindow.prototype.close = function() {
    var self = this; jQuery("#"+self.id).hide();
}

panelWindow.prototype.isShown = function() {
    var self = this;
    return jQuery("#"+self.id).css('display') != 'none';
}

/* INPUT-SELECT CLASS */
// Конструктор класса inputSelect - комбинация input и селекта. Для автозаполнения (autocomplete)
function inputSelect(input, id, enter_fn) {
    this.jInput = jQuery("#"+input);
    this.jSelf = null;
    this.id = id;
    this.width = this.jInput.width();
    if (jQuery.browser.msie) this.width += 5;
    if (jQuery.browser.mozilla) this.width += 1;
    this.height = 150;
    this.z_index = 6;
    this.height_li = 22;			// высота li-элемента. времено зашито жестко
    var self = this;

    // если такой DOM-элемент еще не существует
    if (typeof(jQuery("#"+this.id).get(0)) == "undefined") {
        var html = "<div style='border: 1px solid #B0B0B0; border-top: 1px solid #eee; width: "+this.width+"; position: absolute; " +
                        "z-index: "+this.z_index+"; background: white; height: "+this.height+"; overflow-y: auto; overflow-x: hidden; display:none;' id='"+this.id+"' >";
        html += "</div>";
        this.jInput.after(html);  // создаем DOM-элемент в документе, сразу после input'а
        this.jSelf = jQuery("#"+this.id);

        // позиционируем
        var pos = this.jInput.position();
        var height = this.jInput.height();
        this.jSelf.css('top', pos.top+height+5);
        this.jSelf.css('left', pos.left);

        // Если этого обработчика не было, то создаем его
        if (jQuery('body').data('setEventFor'+this.id) == null) {
            // Обработчик смотрит, если мы кликнули мышкой не по списку объекта inputSelect, а на любом другой участок документа, то
            // список этот закроем
            jQuery('body').click(function(e) {
                jQuery(this).data('setEventFor'+self.id, true);
                var parents = jQuery(e.target).parents();
                var length = parents.length;
                var found = false;
                for (var i = 0; i < length; i++) {
                    if (parents[i].id ==self.id) {
                        found = true; break;
                    }
                }
                if (!found) {
                    self.close();
                }
            });
        }
        self.jSelf.html(self.formListBox());
        self.bindListBoxReaction();					// реакции у элементов списка (фокус и т.д.)
    } else {
        this.jSelf = jQuery("#"+this.id);
    }

    if (this.jInput.data('keyDown') == null) {
        // обработчик нажатия специальных кнопок: стрелка вниз, стрелка вверх, стрелка вправо, стрелка влево,
        // Tab, Enter ...
        this.jInput.data('keyDown', true);
        this.jInput.keydown(function(e) {
            var position, height_li, current_li, top_current_li;
            if (self.isShown()) {
                switch(e.keyCode) {
                    case 40:		// вниз
                        position = (parseInt(self.jInput.data('position')) + 1) % parseInt(self.jInput.data('max_len'));
                        self.jInput.data('position', position);                        
                        self.onout(jQuery("#"+self.id+"_list li"));
                        if (position > 0) {
                            current_li = jQuery("#"+self.id+"_list li").not(':hidden').eq(position-1);
                            // верхняя точка текущего эелемента
                            top_current_li = current_li.position().top;                            
                            height_li = self.height_li;
                            // если верхняя точка текущего элемента больше возможной видимой точки, то спускаемся вниз
                            if (top_current_li > self.height-height_li) {
                                    jQuery("#"+self.id).scrollTop(parseInt(jQuery("#"+self.id).scrollTop())+height_li);
                            }
                            self.onover(current_li);
                            self.jInput.val(current_li.text());
                        } else {
                            jQuery("#"+self.id).scrollTop(0);
                            self.jInput.val(self.jInput.data('value'));
                        }                        
                        break;
                    case 38:		// вверх
                        position = (parseInt(self.jInput.data('position')) - 1);
                        if (position < 0 ) position = parseInt(self.jInput.data('max_len')-1);
                        self.jInput.data('position', position);
                        self.onout(jQuery("#"+self.id+"_list li"));
                        if (position > 0) {
                            current_li = jQuery("#"+self.id+"_list li").not(':hidden').eq(position - 1);
                            // верхняя точка текущего эелемента
                            top_current_li = current_li.position().top;
                            height_li = self.height_li;
                            // если верхняя точка текущего элемента меньше нуля (т.е. уходит вверх за видимую область и еще возможно скролить, то скролим)
                            if (top_current_li < 0 && jQuery("#"+self.id).scrollTop() > 0) {
                                    jQuery("#"+self.id).scrollTop(parseInt(jQuery("#"+self.id).scrollTop())-height_li);
                            }
                            // ситауция, когда нужно прокрутить вних до упора
                            if (position == self.jInput.data('max_len')-1) {
                                    jQuery("#"+self.id).scrollTop(position*height_li);
                            }
                            self.onover(current_li);
                            self.jInput.val(current_li.text());
                        } else {
                            jQuery("#"+self.id).scrollTop(0);
                            self.jInput.val(self.jInput.data('value'));
                        }
                        break;
                    case 9: case 39: case 37:		// Tab || LeftArrow || RightArrow
                        position = parseInt(self.jInput.data('position'));
                        if (position > 0) {
                            jQuery("#"+self.id+"_list li").not(':hidden').eq(position-1).click();
                        }
                        self.close();
                        break;
                    case 13:
                        position = parseInt(self.jInput.data('position'));
                        if (position > 0) {
                            jQuery("#"+self.id+"_list li").not(':hidden').eq(position-1).click();
                        }
                        self.close();
                        enter_fn();
                        break;
                    default:
                        //self.close();
                        break;
                }
            } else {
                if (e.keyCode == 13) {enter_fn();} // нажимаем на enter
            }
        });
    }
}

// Формируем html-список терминов
inputSelect.prototype.formListBox = function() {
    var self = this;
    var items = [];
    var li_width = self.width;
    if (jQuery.browser.msie) li_width -= 2;
    var html = "<ul id='"+self.id+"_list"+"' style='margin: 0; padding: 0 0 0 0; font-family:Trebuchet MS,Tahoma,Verdana,Arial,sans-serif; font-size:1.0em; '>";

    for (k in Glossary.glossary_terms) {
        items = Glossary.glossary_terms[k];
        for (key in items) {
            if (key != 'length') {
                html += "<li id='"+self.id+"_"+key+"' style='margin: 0; padding: 0; width: "+li_width+"; list-style-type: none;'>"+items[key]+"</li>"
            }
        }
    }
    
    html += "</ul>";
    return html;    
}

inputSelect.prototype.onover = function(jObj) {
    var self = this;
    jObj.css('background', '#f8eacf');
}

inputSelect.prototype.onout = function(jObj) {
    jObj.css('background', '#fff');
}

// отображение
inputSelect.prototype.show = function(items) {
    var self = this;
    self.jInput.data('position', 0);                    // Значит фокус на input'е а не на элементе списка
    self.jInput.data('max_len', items.length + 1);      // количество позций для фокуса = размер спика + 1 (учитываем input)
    self.jSelf = jQuery("#"+self.id);			// DOM-element экземпляра класса
    self.filterListBox(items);                          // отфильтровываем список

    // корректировка высоты отображения select'а (должен быть кратен высоте li-элемента)
    if (items.length * self.height_li > self.height) {
        self.height = parseInt(self.height / self.height_li) * self.height_li;
        self.jSelf.height(self.height + 1);
    }

    self.jInput.data('value', self.jInput.val());               // сохраним значние Input'а. Оно еще пригодится
    // показываем - только если список не пустой
    if (items.length > 0) { self.jSelf.show(); }

}

inputSelect.prototype.isShown = function() {
    var self = this;
    return jQuery("#"+self.id).css('display') != 'none';
}

// реакции у элементов списка (фокус и т.д.)
inputSelect.prototype.bindListBoxReaction = function() {
    var self = this;
    // подкрашивается, когда наводим мышкой
    jQuery("#"+self.id+"_list li").mouseover(function() {
        jQuery(this).css('cursor', 'pointer');
    });
    // возвращаем цвет
    jQuery("#"+self.id+"_list li").mouseout(function() {
        jQuery(this).css('cursor', 'default');
    });
    // кликаем на элемент - в input вставляется значение
    jQuery("#"+self.id+"_list li").click(function() {
        self.jInput.val(jQuery(this).text());
        self.close();
    });
}

// Отфильтровать список (остальные скрыть)
inputSelect.prototype.filterListBox = function(items) {
    var self = this;
    if (items.length > 0) {
        jQuery('#'+self.id+'_list li').hide();
        for (key in items) {
            if (key != 'length') {
                jQuery('#'+self.id+'_'+key).show();
            }
        }
    }
}

// Закрываем список
inputSelect.prototype.close = function() {
    var self = this;
    jQuery("#"+self.id).scrollTop(0);
    self.jSelf = jQuery("#"+self.id).hide();
}

Glossary = new GlossaryNS();
