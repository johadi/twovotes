function likeProcess(
  posterId,
  postId,
  userId,
  likeType,
  like1Selector,
  like2Selector,
  vote1Selector,
  vote2Selector) {
  const data = {posterId, postId, userId, likeType};
  const serverUrl = 'http://localhost:4000';

  $.ajax({
    type: "POST",
    dataType: "json",
    url: `${serverUrl}/user/like`,
    data: JSON.stringify(data),//converts the string to json data and sends to server
    //use req.body to get your data on server side.if you don't use this, you will have to get your data using req.params
    contentType: "application/json",
    success: function (returnedData) {
      /*returnedData={
          likeType:1 ,// or 2
          vote1: vote1,
          vote2: vote2,
          like1: like1,
          like2: like2
      }*/

      const vote1 = returnedData.vote1;
      const vote2 = returnedData.vote2;
      const like1 = returnedData.like1;
      const like2 = returnedData.like2;

      $(like1Selector).html(like1);
      $(like2Selector).html(like2);
      $(vote1Selector).html("Votes : " + vote1);
      $(vote2Selector).html("Votes : " + vote2);
    },
    error: function (jqXHR, textStatus, err) {
      //show error message
      alert('text status: ' + textStatus + ', err: ' + err);
    }
  });
}

$(document).ready(function () {
  $(".like1").click(function () {
    //likeProcess();
    const likeRel = $(this).attr("rel");//we use this to name our ID fields for poster and post ids

    const posterIdSelector = "#" + likeRel + "posterId"; //this forms the selector to get our poster ID like- #dsjjksdkjposter
    const postIdSelector = "#" + likeRel + "postId";  //this forms the selector to get our post ID like - #dfjhdjhdjhpost
    const userIdSelector = "#" + likeRel + "userId";

    //get Selector for Like1 id and Like2 id
    const like1Selector = "#" + likeRel + "like1"; //this forms the selector to get our like1 ID e.g- #dsjjksdkjlike1
    const like2Selector = "#" + likeRel + "like2";  //this forms the selector to get our like2 ID e.g - #dfjhdjhdjlike2

    //get Selector for vote1 id and vote2 id
    const vote1Selector = "#" + likeRel + "vote1"; //this forms the selector to get our vote1 ID e.g- #dsjjksdkjvote1
    const vote2Selector = "#" + likeRel + "vote2";  //this forms the selector to get our vote2 ID e.g - #dfjhdjhdjvote2

    const posterId = $(posterIdSelector).val(); //this gets the value of our PosterId proper
    const postId = $(postIdSelector).val(); //this gets the value of our postId proper
    const userId = $(userIdSelector).val();
    likeProcess(posterId, postId, userId, 1, like1Selector, like2Selector, vote1Selector, vote2Selector);
    return false;
  });

  $(".like2").click(function () {
    //likeProcess();
    const likeRel = $(this).attr("rel");//we use this to name our ID fields for poster and post ids

    //get Selector for poster Id and post Id
    const posterIdSelector = "#" + likeRel + "posterId"; //this forms the selector to get our poster ID like- #dsjjksdkjposter
    const postIdSelector = "#" + likeRel + "postId";  //this forms the selector to get our post ID like - #dfjhdjhdjhpost
    const userIdSelector = "#" + likeRel + "userId";

    //get Selector for Like1 id and Like2 id
    const like1Selector = "#" + likeRel + "like1"; //this forms the selector to get our like1 ID e.g- #dsjjksdkjlike1
    const like2Selector = "#" + likeRel + "like2";  //this forms the selector to get our like2 ID e.g - #dfjhdjhdjlike2

    //get Selector for vote1 id and vote2 id
    const vote1Selector = "#" + likeRel + "vote1"; //this forms the selector to get our vote1 ID e.g- #dsjjksdkjvote1
    const vote2Selector = "#" + likeRel + "vote2";  //this forms the selector to get our vote2 ID e.g - #dfjhdjhdjvote2

    const posterId = $(posterIdSelector).val(); //this gets the value of our PosterId proper
    const postId = $(postIdSelector).val(); //this gets the value of our postId proper
    const userId = $(userIdSelector).val();

    likeProcess(posterId, postId, userId, 2, like1Selector, like2Selector, vote1Selector, vote2Selector);
    return false;
  });
});
