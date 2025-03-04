const cloudName = "dddhappm3";
const uploadPreset = "ml_default";

const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const progressContainer = document.getElementById("progress-container");
const statusText = document.getElementById("status");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const files = fileInput.files;
  if (files.length === 0) {
    statusText.textContent = "Please select at least one image.";
    return;
  }

  statusText.textContent = "Uploading...";
  progressContainer.innerHTML = "";

  const progressBars = Array.from(files).map((file) => {
    const progressItem = document.createElement("div");
    progressItem.className = "progress-item";

    const fileName = document.createElement("div");
    fileName.textContent = file.name;

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    const progressBarFill = document.createElement("div");
    progressBarFill.className = "progress-bar-fill";

    progressBar.appendChild(progressBarFill);
    progressItem.appendChild(fileName);
    progressItem.appendChild(progressBar);
    progressContainer.appendChild(progressItem);

    return { file, progressItem, progressBarFill };
  });

  try {
    const uploadPromises = progressBars.map(
      ({ file, progressItem, progressBarFill }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        return axios
          .post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData,
            {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                progressBarFill.style.width = `${percentCompleted}%`;
              },
            }
          )
          .then((response) => {
            progressItem.style.display = "none";
            return response;
          });
      }
    );

    const results = await Promise.all(uploadPromises);

    //  results.forEach((response) => {
    //   console.log('Uploaded image URL:', response.data.secure_url);
    // });

    statusText.textContent = `${files.length} images uploaded successfully!`;
  } catch (error) {
    console.error("Error uploading images:", error);
    statusText.textContent = "An error occurred. Please try again.";
  }
});
