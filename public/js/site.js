var win = function (ans) {
    var otherAns = "#a";
    if (ans == "#a")
        otherAns = "#b";
    $(ans).find('a').addClass("win");
    $(otherAns).find('a').addClass("lose");
    points++;
    setTimeout(function () {
        getQuestion();
    }, 1000);
}
var loss = function (ans) {
    var otherAns = "#a";
    if (ans == "#a")
        otherAns = "#b";
    $(ans).find('a').addClass("lose")
    $(otherAns).find('a').addClass("win")
    points = 0;
    setTimeout(function () {
        getQuestion();
    }, 1000);
}


var quiz = function (opts) {
    this.variables = {
        current: 0,
        score: 0,
        maxAns: 2,
        onWin: function (response) {},
        onLoss: function (response) {},
        onAnswer: function(idx) {},
        renderQuestion: function () {
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
        },
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
           setTimeout(getQuestion,1000);
        });
    };
    variables.current = Math.floor((Math.random() * variables.maxAns));
    getQuestion();
};



var topCeleb = quiz({
    onWin: function(answer){
        renderAnswer(true,answer.correctAnswer,answer.answers);
    },
    onLose: function(answer){
        renderAnswer(false,answer.correctAnswer,answer.answers);
    },
    onAnswer: function(answer){
        $('li').unbind()
    }
});

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
    
}
