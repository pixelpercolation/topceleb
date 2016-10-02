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
            var max = Math.max.apply(Math, celebs.map(x => x.data));
            var min = Math.min.apply(Math, celebs.map(x => x.data));
            if (inverse) {
                response = min == answer;
            }
            else {
                response = max == answer;
            }
            callback(null, response);
        }).catch(reason => {
            callback(null, reason);
        });
    });
};