(function () {
  function isMediaUploadInput(input) {
    return input instanceof HTMLInputElement && input.type === "file";
  }

  function enableMultipleUpload(root) {
    const inputs = root.querySelectorAll
      ? root.querySelectorAll("input[type='file']")
      : [];

    inputs.forEach(function (input) {
      input.multiple = true;
      input.setAttribute("multiple", "");
    });
  }

  function dispatchSingleFileChange(input, file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  document.addEventListener(
    "click",
    function (event) {
      const uploadButton = event.target.closest
        ? event.target.closest(".nc-fileUploadButton")
        : null;

      if (uploadButton) {
        enableMultipleUpload(uploadButton);
      }
    },
    true,
  );

  document.addEventListener(
    "change",
    function (event) {
      const input = event.target;

      if (!isMediaUploadInput(input) || input.files.length < 2) {
        return;
      }

      const files = Array.from(input.files);
      event.preventDefault();
      event.stopImmediatePropagation();

      files.forEach(function (file, index) {
        window.setTimeout(function () {
          dispatchSingleFileChange(input, file);
        }, index * 150);
      });
    },
    true,
  );

  enableMultipleUpload(document);

  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          enableMultipleUpload(node);
        }
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
