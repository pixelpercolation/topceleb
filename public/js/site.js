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
        onWin: function (idx) {},
        onLoss: function (idx) {},
        renderQuestion: function () {
            $('li').find('span').addClass('invisible')
            var list = $('ul');
            list.empty();
            list.append($('<h1 class="invisible" id="q">').text(variables.question.question.text));
            variables.question.celebs.forEach(function (answer) {
                var ans = $(variables.answerTemplate.replace('[NAME]', answer.name));
                ans.css('background-image', 'url(' + answer.image + ')')
                ans.attr('data-idx', answer.index);
                ans.click(function () {
                    checkAnswer(ans.attr('data-idx'));
                });
                list.append(ans);
            });
            $('.score').text("" + variables.score);
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
        $.get("https://wt-neonboxx-googlemail_com-0.run.webtask.io/getQuestion?max=" + variables.maxAns + "&current=" + variables.current, function (question) {
            variables.question = question;
            variables.renderQuestion();
        });
    };
    this.checkAnswer = function (answer) {
        var options = variables.question.celebs.map(function (ans) {
            return ans.index
        }).join(',');
        $.get("https://wt-neonboxx-googlemail_com-0.run.webtask.io/checkAnswer?question=" + variables.question.question.type + "&answer=" + answer + "&options=" + options, function (response) {
            if (response.correct) {
                variables.score++;
                variables.current = answer;
                variables.onWin(response.correctAnswer,response.answers);
            } else {
                variables.current = null;
                variables.score = 0;
                variables.onLose(response.correctAnswer,response.answers);
            }
           setTimeout(getQuestion,1000);
        });
    };
    

    variables.current = Math.floor((Math.random() * variables.maxAns));
    getQuestion();
};



var topCeleb = quiz({
    onWin: function(answer,answers){
        renderAnswer(true,answer,answers);
    },
    onLose: function(answer,answers){
        renderAnswer(false,answer,answers);
    },
});

var renderAnswer = function(win,answer,answers){
    answers.forEach(function(a){
        $('li[data-idx="'+a.index+'"]').find('span').text(a.data);
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
