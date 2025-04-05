const cloudName = "dddhappm3";
const uploadPreset = "ml_default";

const categoryColors = {
  armchairs: [
    "cloud-beige",
    "yellow-pear",
    "rusty-red-wool",
    "beige-wool",
    "blueberry-pie-wool",
    "dark gray",
    "light-grey",
    "dark yellow",
    "light green"
  ],
  accessories: ["yellow", "forest-green", "blueberry", "piazza-beige"],
  sofas: [
    "beige",
    "light-grey",
    "graphite-black",
    "dark",
    "light blue",
    "dark blue",
    "dark gray",
    "light green",
    "dark green",
  ],
  beds: ["walnut", "oak","dark gray","light blue","white stained","pine"],
  storage: ["oak", "black-oak", "blueberry", "vulcano-black"],
  tvStands: ["terracotta-blush", "vulcano-black", "almond-grey"],
  outdoor: ["vulcano-black", "forest-green", "orange-peel"],
};

const categorySelect = document.getElementById("category");
const colorSelect = document.getElementById("color");
const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const progressContainer = document.getElementById("progress-container");
const statusText = document.getElementById("status");

Object.keys(categoryColors).forEach((category) => {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  categorySelect.appendChild(option);
});

categorySelect.addEventListener("change", function () {
  const selectedCategory = this.value;
  colorSelect.innerHTML = '<option value="">Select a color</option>';
  colorSelect.disabled = !selectedCategory;

  if (selectedCategory) {
    categoryColors[selectedCategory].forEach((color) => {
      const option = document.createElement("option");
      option.value = color;
      option.textContent = color;
      colorSelect.appendChild(option);
    });
  }
});

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = categorySelect.value;
  const color = colorSelect.value;
  const files = fileInput.files;

  if (!category || !color) {
    statusText.textContent = "Please select a category and a color 🙂";
    return;
  }

  if (files.length === 0) {
    statusText.textContent = "Please select at least one image";
    return;
  }

  statusText.textContent = "Uploading...";
  progressContainer.innerHTML = "";

  const uploadPromises = Array.from(files).map((file) => {
    const productName = file.name.split("-")[0].trim();

    const folderPath = `categories/${category}/${productName}/${color}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folderPath);

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

    return axios.post(
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
    );
  });

  try {
    await Promise.all(uploadPromises);
    statusText.textContent = `${files.length} images uploaded successfully!`;
  } catch (error) {
    console.error("Upload failed:", error);
    statusText.textContent = "Error! Please try again.";
  }
});
