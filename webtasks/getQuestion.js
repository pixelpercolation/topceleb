const firebase = require('firebase@3.1.0');
module.exports = function (context, callback) {
    var celebs = [];
    var question = {};
    var config = {
        apiKey: context.secrets.firebaseApiKey,
        databaseURL: context.secrets.firebaseUrl
    };
    if (!firebase.apps || firebase.apps.length < 1)
        firebase.initializeApp(config);

    var currIdx = parseInt(context.query.current);
    var excludeIdx = parseInt(context.query.exclude);
    var exclude = [];
    if(!isNaN(excludeIdx))
        exclude.push(excludeIdx);
    var celebsRef = firebase.database().ref("celebs");
    var catRef = firebase.database().ref("categories");

    catRef.on("value", function (snapshot) {
        var key = "";
        var count = snapshot.numChildren();
        var idx = Math.floor((Math.random() * count));
        var query = catRef.orderByChild("index").startAt(idx).limitToFirst(1);
        query.on("value", function (children) {
            children.forEach(function (a) {
                key = a.key;
                question.type = a.key;
                question.text = a.val().question;
            });
            celebsRef.on("value", function (snapshot) {
                var count = snapshot.numChildren();
                var max = context.query.max ? context.query.max : 2;
                var first = isNaN(currIdx) ? Math.floor(Math.random() * count) : currIdx;
                var indexes = [first];
                while (indexes.length < max) {
                    var next = first;
                    while (indexes.indexOf(next) > -1 && exclude.indexOf(next)) {
                        next = Math.floor((Math.random() * count));
                    }
                    indexes.push(next);
                }
                indexes.forEach(function (idx) {
                    var query = celebsRef.orderByChild("index").startAt(idx).limitToFirst(1);
                    query.on("value", function (snapshot) {
                        snapshot.forEach(function (a) {
                            var celeb = {
                                name: a.key,
                                data: a.val()
                            };
                            celebs.push(celeb);
                        });
                    });
                });
                var response = {
                    question: question,
                    celebs: celebs.map(function (x) {
                        return { name: x.name, image: x.data.image, index: x.data.index }
                    })
                };
                callback(null, response);
            });
        });
    });
};
