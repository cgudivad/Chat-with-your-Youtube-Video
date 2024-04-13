$(document).ready(function () {
  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    $("#micButton").addClass("d-flex").show();
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = true;
    const prompt = document.getElementById("prompt");

    $("#micButton").click(function () {
      prompt.textContent = "Listening...";
      recognition.start();
    });

    recognition.onresult = (event) => {
      prompt.textContent = event.results[0][0].transcript;
    };

    recognition.onaudioend = (event) => {
      if (prompt.textContent === "Listening...") {
        prompt.textContent = "";
      }
      $("#generateButton").trigger("click");
    };

    recognition.onerror = (event) => {
      console.error("Error occurred in recognition: " + event.error);
    };
  } else {
    $("#micButton").hide();
  }

  $("#darkModeSwitch").change(function () {
    if ($(this).is(":checked")) {
      $("html").attr("data-bs-theme", "dark");
    } else {
      $("html").attr("data-bs-theme", "light");
    }
  });

  $("#loadButton").click((event) => {
    event.preventDefault();

    if (!$("#url").val()) {
      showMessage("error", "Youtube URL is required!");
      return;
    }

    addSpinner("#loadButton");

    $.ajax({
      type: "POST",
      url: "/load",
      data: {
        url: $("#url").val(),
      },
      success: function (response) {
        showMessage("success", "Video loaded successfully!");
      },
      error: function (xhr, status, error) {
        showMessage("error", xhr.responseText);
      },
      complete: function () {
        removeSpinner("#loadButton");
      },
    });
  });

  $("#generateButton").click((event) => {
    event.preventDefault();

    if (!$("#prompt").val()) {
      showMessage("error", "Prompt is required!");
      return;
    }

    addSpinner("#generateButton");

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
          return response.text().then((errorMessage) => {
            throw new Error(errorMessage);
          });
        }
        const reader = response.body.getReader();
        const textDecoder = new TextDecoder();
        const processChunk = ({ value, done }) => {
          if (done) {
            removeSpinner("#generateButton");
            $("#response").html(
              $("#response")
                .html()
                .replaceAll(" **", " <b>")
                .replaceAll("**", "</b>")
            );
            return;
          }
          text = textDecoder.decode(value);
          $("#response").append(text);
          $("html, body").animate(
            {
              scrollTop: $("#responseDiv").offset().top,
            },
            0
          );
          reader.read().then(processChunk);
        };
        $("#responseDiv").show();
        reader.read().then(processChunk);
      })
      .catch((error) => {
        console.log(error);
        showMessage("error", error);
      })
      .finally(() => {
        removeSpinner("#generateButton");
      });
  }

  function showMessage(status, message) {
    if (status === "error") {
      $("h4#modalHeading")
        .text("Error")
        .removeClass("text-success")
        .addClass("text-danger");
    } else if (status === "success") {
      $("h4#modalHeading")
        .text("Success")
        .removeClass("text-danger")
        .addClass("text-success");
    }
    $("#modalContent").text(message);
    $("#openModal").trigger("click");
  }

  function addSpinner(element) {
    $(element).prop("disabled", true);
    $(element).find("#buttonText").hide();
    $(element).find("#buttonSpinner").show();
  }

  function removeSpinner(element) {
    $(element).find("#buttonText").show();
    $(element).find("#buttonSpinner").hide();
    $(element).prop("disabled", false);
  }
});
