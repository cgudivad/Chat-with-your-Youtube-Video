$(document).ready(function () {
  const alertMap = {
    error: "danger",
    success: "success",
  };

  $("#darkModeSwitch").change(function () {
    if ($(this).is(":checked")) {
      $("html").attr("data-bs-theme", "dark");
    } else {
      $("html").attr("data-bs-theme", "light");
    }
  });

  $(".btn-close").click(function () {
    hideMessage();
  });

  $("#loadButton").click((event) => {
    event.preventDefault();

    hideMessage();

    if (!$("#url").val()) {
      showMessage("error", "Youtube URL is required!");
      return;
    }

    $("#loadButton").append(
      '   <span class="spinner-border spinner-border-sm"></span>'
    );
    $.ajax({
      type: "POST",
      url: "/load",
      data: {
        url: $("#url").val(),
      },
      success: function (response) {
        if (response.status == "error") {
          showMessage("error", response.message);
        } else if (response.status == "success") {
          showMessage("success", "Video loaded successfully!");
        }
      },
      error: function (xhr, status, error) {
        console.error(xhr.responseText);
      },
      complete: function () {
        $("#loadButton").find("span").remove();
      },
    });
  });

  $("#generateButton").click((event) => {
    event.preventDefault();

    hideMessage();

    if (!$("#prompt").val()) {
      showMessage("error", "Prompt is required!");
      return;
    }

    $("#generateButton").append(
      '   <span class="spinner-border spinner-border-sm"></span>'
    );

    $("#responseDiv").hide();
    $("#response").empty();

    streamData();
  });

  function streamData(promptValue, modelValue) {
    const url = "/generate";
    const formData = new FormData();
    formData.append("prompt", $("#prompt").val());
    formData.append("model", $("#model").val());
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const reader = response.body.getReader();
        const textDecoder = new TextDecoder();
        startFlag = false;
        const processChunk = ({ value, done }) => {
          if (done) {
            $("#generateButton").find("span").remove();
            return;
          }
          text = textDecoder.decode(value);
          if (text.includes('**')) {
            // if(startFlag) {
            //   text = text.replace('**', '</b>');
            // } else {
            //   text = text.replace('**', '<b>');
            // }
            // startFlag = !startFlag;
            text = text.replace('**', '');
          }
          $("#response").html(
            $("#response").html() + text
          );
          $('html, body').animate({
            scrollTop: $('#responseDiv').offset().top
          }, 0);
          reader.read().then(processChunk);
        };
        $("#responseDiv").show();
        reader.read().then(processChunk);
      })
      .catch((error) => {
        showMessage("error", error);
      })
      .finally(() => {
        $("#generateButton").find("span").remove();
      });
  }

  function showMessage(status, message) {
    $("#displayMessage").text(message);
    $("#displayMessageDiv").addClass("alert-" + alertMap[status]);
    $("#displayMessageDiv").show();
  }

  function hideMessage() {
    $("#displayMessageDiv").removeClass("alert-danger alert-success");
    $("#displayMessageDiv").hide();
  }
});
