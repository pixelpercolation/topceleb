const firebase = require('firebase@3.1.0');
module.exports = (context, callback) => {
    var config = {
        apiKey: context.secrets.firebaseApiKey,
        databaseURL: context.secrets.firebaseUrl
    };

    if (!firebase.apps || firebase.apps.length < 1)
        firebase.initializeApp(config);

    var answer = context.query.answer;
    var question = context.query.question;
    var inverse = question.charAt(question.length - 1) == '2';
    if (inverse)
        question = question.substr(0, question.length - 1);
    var options = context.query.options.split(',');
    var celebsRef = firebase.database().ref("celebs");
    options = options.map(x => parseInt(x))
    celebsRef.on("value", snapshot => {
        var promiseArray = [];
        options.forEach(idx => {
            promiseArray.push(new Promise((resolve) => {
                var query = celebsRef.orderByChild("index").startAt(idx).limitToFirst(1);
                query.on("value", snapshot => {
                    snapshot.forEach(a => {
                        var celeb = {
                            index: a.val().index,
                            name: a.key,
                            data: a.val()[question]
                        };
                        resolve(celeb);
                    });
                });
            }));
        });
        Promise.all(promiseArray).then(celebs => {
            var mapFunc = x => x.data;
            if (question == "dob")
                mapFunc = x => Date.parse(x.data);
            var ans = celebs.filter(x => x.index == answer).map(mapFunc)[0];
            var max = Math.max.apply(Math, celebs.map(mapFunc));
            var min = Math.min.apply(Math, celebs.map(mapFunc));
            if (inverse) {
                response = min == ans;
            }
            else {
                response = max == ans;
            }
            console.log(question, min, max, ans, response)
            callback(null, {
                correct: response,
                correctAnswer: inverse?min:max,
                answers: celebs.map(x => {
                return {    index:x.index,data:mapFunc(x)}
                })
            });
        }).catch(reason => {
            callback(null,
                {
                    error: reason
                });
        });
    });
};