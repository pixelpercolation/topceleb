var quiz = function (opts) {
    this.variables = {
        current: 0,
        score: 0,
        maxAns: 2,
        timeoutLength: 3000,
        onWin: function (response) {},
        onLoss: function (response) {},
        onAnswer: function(idx) {},
        onLoad: function(){},
        renderQuestion: function () {},
        question: {},
        answerTemplate: `
            <li>
                <a class="name" href="#">
                <p>[NAME]</p>
                <span class="invisible">[VALUE]</span>
                </a>
            </li>
        `
    };
    for(var parameter in opts){
        this.variables[parameter] = opts[parameter];
    }

    this.getQuestion = function () {
        variables.onGetQuestion();
        $.get("https://wt-neonboxx-googlemail_com-0.run.webtask.io/getQuestion?max=" + variables.maxAns + "&current=" + variables.current +'&exclude='+variables.exclude, function (question) {
            variables.question = question;
            variables.renderQuestion();
        });
    };
    this.checkAnswer = function (answer) {
        variables.onAnswer(answer);
        var options = variables.question.celebs.map(function (ans) {
            return ans.index
        }).join(',');
        $.get("https://wt-neonboxx-googlemail_com-0.run.webtask.io/checkAnswer?question=" + variables.question.question.type + "&answer=" + answer + "&options=" + options, function (response) {
            if (response.correct) {
                variables.score++;
                variables.current = answer;
                var exclude = variables.question.celebs.map(function (ans) {
                    return ans.index
                }).filter(function(a){
                    return a!=answer;
                });
                variables.exclude = exclude[0];
                variables.onWin(response);
            } else {
                variables.current = null;
                variables.exclude = null;
                variables.score = 0;
                variables.onLose(response);
            }
            variables.timeout = setTimeout(function () {
                getQuestion();
            }, variables.timeoutLength);
        });
    };
    variables.current = Math.floor((Math.random() * variables.maxAns));
    variables.onLoad();
    getQuestion();
};

var renderQuestion = function(){
    $('li').find('span').addClass('invisible')
        var list = $('ul');
        $('#q').text(variables.question.question.text).removeClass('invisible');
        $('li[data-idx]').each(function(i,a){
            var idx = parseInt($(a).attr('data-idx'));
            if(variables.question.celebs.map(function(c){return c.index}).indexOf(idx) < 0)
                $(a).remove();
        });
        variables.question.celebs.forEach(function (answer) {
            var ans = list.find('li[data-idx="'+answer.index+'"]');
            if(ans.length == 0)
                ans = $(variables.answerTemplate.replace('[NAME]', answer.name));
            else
                ans.find('a').removeClass('win').removeClass('lose');
            ans.css('background-image', 'url(' + answer.image + ')');
            ans.attr('data-idx', answer.index);
            ans.click(function () {
                checkAnswer(ans.attr('data-idx'));
            });
            list.append(ans);
        });
        $('.score').text(variables.score);
}

var renderAnswer = function(win,answer,answers){
    answers.forEach(function(a){
        $('li[data-idx="'+a.index+'"]').find('span').text(a.friendly);
    });
    var correct = answers.filter(function(a){
        return a.data == answer
    }).map(function(x){
        return x.index
    });
    $('h1').addClass('invisible');
    $('li').find('a').addClass('lose');
    $('li').find('span').removeClass('invisible');
    correct.forEach(function(idx){
        $('li[data-idx="'+idx+'"]').find('a').removeClass('lose').addClass('win');
    });
    $('.next').fadeIn().addClass('animate');
}

var onLoad = function(){
    $('.next').click(next);
}

var next = function(){
    clearTimeout(variables.timeout);
    console.log(variables.timeout);
    getQuestion();
}
var interval = function(){};
var topCeleb = quiz({
    onWin: function(answer){
        renderAnswer(true,answer.correctAnswer,answer.answers);
    },
    onLose: function(answer){
        $('.next').addClass('wrong');
        renderAnswer(false,answer.correctAnswer,answer.answers);
    },
    onGetQuestion: function(){
        $('.next').hide();
        $('.next').removeClass('animate').removeClass('wrong');
    },
    onAnswer: function(answer){
        $('li').unbind();
    },
    renderQuestion: function(){
        renderQuestion();
    },
    onLoad:function(){
        onLoad();
    }
});
