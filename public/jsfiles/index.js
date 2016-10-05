function likeProcess(posterId,postId,userId,likeType,like1Selector,like2Selector,vote1Selector,vote2Selector) {
    var data={posterId:posterId,postId:postId,userId:userId,likeType:likeType}

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "http://localhost:4000/user/like",
        data: JSON.stringify(data) ,//converts the string to json data and sends to server
        contentType: "application/json", //use req.body to get your data.if you don't use this, you will have to get your data using req.params
        success: function(returnedData) {
            /*returnedData={
                likeType:1 ,// or 2
                vote1: vote1,
                vote2: vote2,
                like1: like1,
                like2: like2
            }*/

            var vote1=returnedData.vote1;
            var vote2=returnedData.vote2;
            var like1=returnedData.like1;
            var like2=returnedData.like2;

            $(like1Selector).html(like1);
            $(like2Selector).html(like2);
            $(vote1Selector).html("Votes : "+vote1);
            $(vote2Selector).html("Votes : "+vote2);

           // alert("vote1 :"+vote1+" vote2: "+vote2+" like1 : "+like1+" like2 : "+like2);
            //alert(returnedData);
        },
        error: function(jqXHR, textStatus, err) {
            //show error message
            alert('text status '+textStatus+', err '+err);
        }
    });
}

$(document).ready(function(){
    $(".like1").click(function(){
        //likeProcess();
        //alert($(".hdlike1").val());
        var likeRel=$(this).attr("rel");//we use this to name our ID fields for poster and post ids

        var posterIdSelector="#"+likeRel+"posterId"; //this forms the selector to get our poster ID like- #dsjjksdkjposter
        var postIdSelector="#"+likeRel+"postId";  //this forms the selector to get our post ID like - #dfjhdjhdjhpost
        var userIdSelector="#"+likeRel+"userId";

        //get Selector for Like1 id and Like2 id
        var like1Selector="#"+likeRel+"like1"; //this forms the selector to get our like1 ID e.g- #dsjjksdkjlike1
        var like2Selector="#"+likeRel+"like2";  //this forms the selector to get our like2 ID e.g - #dfjhdjhdjlike2

        //get Selector for vote1 id and vote2 id
        var vote1Selector="#"+likeRel+"vote1"; //this forms the selector to get our vote1 ID e.g- #dsjjksdkjvote1
        var vote2Selector="#"+likeRel+"vote2";  //this forms the selector to get our vote2 ID e.g - #dfjhdjhdjvote2

        var posterId=$(posterIdSelector).val(); //this gets the value of our PosterId proper
        var postId=$(postIdSelector).val(); //this gets the value of our postId proper
        var userId=$(userIdSelector).val();
        likeProcess(posterId,postId,userId,1,like1Selector,like2Selector,vote1Selector,vote2Selector);
        //alert(postId+" and "+posterId);
        return false;
    });

    $(".like2").click(function(){
        //likeProcess();
        //alert($(".hdlike1").val());
        var likeRel=$(this).attr("rel");//we use this to name our ID fields for poster and post ids

        //get Selector for poster Id and post Id
        var posterIdSelector="#"+likeRel+"posterId"; //this forms the selector to get our poster ID like- #dsjjksdkjposter
        var postIdSelector="#"+likeRel+"postId";  //this forms the selector to get our post ID like - #dfjhdjhdjhpost
        var userIdSelector="#"+likeRel+"userId";

        //get Selector for Like1 id and Like2 id
        var like1Selector="#"+likeRel+"like1"; //this forms the selector to get our like1 ID e.g- #dsjjksdkjlike1
        var like2Selector="#"+likeRel+"like2";  //this forms the selector to get our like2 ID e.g - #dfjhdjhdjlike2

        //get Selector for vote1 id and vote2 id
        var vote1Selector="#"+likeRel+"vote1"; //this forms the selector to get our vote1 ID e.g- #dsjjksdkjvote1
        var vote2Selector="#"+likeRel+"vote2";  //this forms the selector to get our vote2 ID e.g - #dfjhdjhdjvote2

        var posterId=$(posterIdSelector).val(); //this gets the value of our PosterId proper
        var postId=$(postIdSelector).val(); //this gets the value of our postId proper
        var userId=$(userIdSelector).val();

        likeProcess(posterId,postId,userId,2,like1Selector,like2Selector,vote1Selector,vote2Selector);
        //alert(postId+" and "+posterId);
        return false;
    });
});
