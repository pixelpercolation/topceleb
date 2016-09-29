var config = {
    apiKey: "AIzaSyAI1SBQ5AOHoKtywLouQmQ3xk2c_mXxEmA",
    authDomain: "topceleb-5e105.firebaseapp.com",
    databaseURL: "https://topceleb-5e105.firebaseio.com",
    storageBucket: "topceleb-5e105.appspot.com",
    messagingSenderId: "548658843199"
};
firebase.initializeApp(config);
var celebsRef = firebase.database().ref("celebs");
var catRef = firebase.database().ref("categories");
var answerA = {};
var answerB = {};
var question = {};
var points = 0;
var getCelebs = function () {

    celebsRef.on("value", function (snapshot) {
        var count = snapshot.numChildren();

        var aIdx = Math.floor((Math.random() * count));
        var bIdx = aIdx;
        while (aIdx == bIdx) {
            bIdx = Math.floor((Math.random() * count));
        }

        var queryA = celebsRef.orderByChild("index").startAt(aIdx).limitToFirst(1);
        var queryB = celebsRef.orderByChild("index").startAt(bIdx).limitToFirst(1);

        queryA.on("value", function (aSnapshot) {
            aSnapshot.forEach(function (a) {
                $('.a-name').text(a.key);
                $('#a').css('background-image', 'url(' + a.val().image + ')');
                $('.a-name').val(a.val().index);
                answerA = a.val();
            });
        });
        queryB.on("value", function (bSnapshot) {
            bSnapshot.forEach(function (a) {
                $('.b-name').text(a.key);
                $('#b').css('background-image', 'url(' + a.val().image + ')');
                $('.b-name').val(a.val().index);
                answerB = a.val();
                $('#message').removeClass('start')
            });
        });
    });
}
var getQuestion = function () {
    $('.points').text(points);
    catRef.on("value", function (snapshot) {
        var key = "";
        var count = snapshot.numChildren();
        var idx = Math.floor((Math.random() * count));
        var query = catRef.orderByChild("index").startAt(idx).limitToFirst(1);
        query.on("value", function (children) {
            children.forEach(function (a) {
                key = a.key;
                question = a.val();
                $('#q').text(question.question);
                getCelebs();
            });
        });
    });
}
var win = function (ans) {
    $( ans).addClass("win")
    points++;
    setTimeout(getQuestion,2000);
}
var loss = function (ans) {
    $( ans).addClass("lose")
    setTimeout(getQuestion,2000);
}

getQuestion();
$('a').click(function (e) {
    if (question.type == "dob") {
        if ((e.target.value == answerA.index) == (answerA.dob < answerB.dob))
            win(e.target.id)
        else
            loss(e.target.id)

        return
    }
    if (question.type == "dob2") {
        if ((e.target.value == answerA.index) == (answerA.dob > answerB.dob))
            win(e.target.id)
        else
            loss(e.target.id)

        return
    }
    if (question.type == "height") {
        if ((e.target.value == answerA.index) == (answerA.height > answerB.height))
            win(e.target.id)
        else
            loss(e.target.id)
        return
    }
    if (question.type == "height2") {
        if ((e.target.value == answerA.index) == (answerA.height < answerB.height))
            win(e.target.id)
        else
            loss(e.target.id)
        return
    }

});