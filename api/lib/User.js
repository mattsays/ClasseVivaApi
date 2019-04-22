const cheerio = require('cheerio')
const request = require('request-promise')

function User(session_id){

    const base_url = 'https://web.spaggiari.eu'

    this.session_id = session_id

    this.req = (path) => {
        return request({
                uri: path,
                headers: {
                    'Set-Cookie': 'PHPSESSID=' + this.session_id,
                    'Cookie': 'PHPSESSID=' + this.session_id
                },
                transform: (body) => {
                    return cheerio.load(body);
                }
            })
    }
/*
    Note 
    {
        Teacher
        Date
        Content
        Type
    }
*/
    this.notes = () => {
        return this.req(base_url + '/fml/app/default/gioprof_note_studente.php')
            .then(($) => {
                var notes = []

                if($('.name').text() == '')
                    throw new Error('Invalid Session ID')

                $('#sort_table tbody tr').each((i, entry) => {
                    var note = {}
                    $(entry).children('td').each((i, field) => {
                        var value = $(field).text().replace(/\n/g, '')
                        switch(i) {
                            case 0:
                                note.teacher_name = value
                                break
                            case 1:
                                note.date = value
                                break
                            case 2:
                                note.content = value
                                break
                            case 3:
                                note.type = value
                                break
                        }
                    })
                    notes.push(note)
                })
                return notes
            })
    }

    /*
    Grade 
    {
        Subject
        Date
        Type
        Value
    }
*/

    this.grades = () => {
        return this.req(base_url + '/cvv/app/default/genitori_note.php?filtro=tutto')
            .then($ => {
                if($('.name').text() == '')
                    throw new Error('Invalid Session ID')
                var elements = []
                $('tbody tr')
                    .not('#placeholder_row tr.griglia .page-header .bg_color_ff0000 .bg_color_666666 .bg_color_bbbbbb .pase_usr .griglia noprint')
                    .each((i, e) => {
                        var children = $(e).children('td')
                        if(children.length == 1){
                            var element = $(e).text().replace(/\n/g, '')
                                if(element != '') {
                                    elements.push(element.trim())
                                }
                            }
                        else {
                            elements.push($(children[1]).find('p span').text())
                            elements.push($(children[2]).find('p').attr('title'))
                            elements.push($(children[3]).find('div.cella_div p').text().replace(/\n/g, ''))
                        }
                    })
                return getGradesFromArray(elements)
            })
    }
    /*
    Absences
    {
        Absences
        Delay
    }
*/
    this.absences = () => {
        return this.req(base_url + '/tic/app/default/consultasingolo.php#eventi')
            .then($ => {
                var absences = {}
                if($('.name').text() == '')
                    throw new Error('Invalid Session ID')
                var td = $($('#skeda_eventi tbody').children('tr[height=38]')[0]).children('td')
                var absences_str = $(td[1]).find('p').text().replace(/\n/g, '').trim()
                var index = absences_str.indexOf('(')
                absences.absences = getNumbersFromString(absences_str.substr(0, index-1))
                absences.delays = getNumbersFromString($(td[3]).find('p font').text().replace(/\n/g, '').trim())
                return absences
            })
    }

    /*
    Lesson 
    {
        Argument
        Time
        Subject
        Teacher
    }
*/
    this.lessons = (date = '') => {
        return this.req(base_url + '/cvv/app/default/regclasse.php?data_start=' + date)
            .then( $ => {
                if($('.name').text() == '')
                    throw new Error('Invalid Session ID')

                var temp_lessons = []
                $('.rigtab').not('[style="display:none;"]').each((i, element) => {
                    if($(element).find('td').text().trim() != ''){
                        var lesson = {}
                        var td = $(element).children('td')
                        
                        lesson.teacher = $($(td[1]).children('div')[0]).text().replace(/\n/g, '')
                        
                        var time = $(td[2]).text().replace(/\n/g, '').trim()
                        var index = time.indexOf('(')-1
                        lesson.time = getNumbersFromString(time.substr(0, index))
                        lesson.subject = $($(td[3]).children('span')[0]).text().trim().replace(/\n/g, '')
                        lesson.argument = $(td[4]).find('span').text().replace(/\n/g, '')
                        if(lesson.argument.includes('Lezione:')) {
                            lesson.argument = lesson.argument.slice(8)
                        }
                        temp_lessons.push(lesson)
                    }
                })
                var final_lessons = []
                if(temp_lessons.lenght != 0){
                    var lessons = temp_lessons.slice(2)
                    lessons.forEach(lesson => {
                        if(lesson.argument != '' && lesson.subject != '' && lesson.time != '' && lesson.teacher != '') {
                            final_lessons.push(lesson)
                        }
                    })
                }
                if(final_lessons.length == 0) {
                    return 'Absent or there was no lession'
                }
                return final_lessons
            })
    }

}

function getGradesFromArray(elements){
    var grades = []
    var grade = {}
    elements.forEach(element => {
        if(grade.value != null && grade.date != null && grade.type != null){
            var value = Object.assign({}, grade)
            grades.push(value)
            grade.value = null
            grade.date = null
            grade.type = null
        }
        if(element != undefined){
            if(isStringUpperCase(element.trim()) && !(/\d+/.test(element.trim())))
                grade.subject = element.trim()
            else if(element.length <= 2)
                grade.value = element.trim()
            else if(/\d+/.test(element.trim()))
                grade.date = element.trim()
            else
                grade.type = element.trim()
        }
    });
    return grades
}

function getNumbersFromString(string) {
    var char = ''
    var i = 0
    var final_string = ''
    while(i <= string.length){
        char = string.charAt(i)
        if(/\d+/.test(char)) {
            final_string+= char
        }
        i++
    }
    return final_string
}

function isStringUpperCase(string){
    var char = ''
    var i = 0
    while(i <= string.length){
        char = string.charAt(i)

        if(char != char.toUpperCase())
            return false

        i++
    }
    return true
}


module.exports = User