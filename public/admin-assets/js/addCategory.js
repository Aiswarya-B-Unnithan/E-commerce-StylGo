

    const imageInputs = document.querySelectorAll('input[name="images"]');
    const cropButton = document.getElementById('cropImgBtn');
    const categoryForm = document.getElementById('categoryForm');
    const imageContainer=document.getElementById('image-container')
    const croppers = [];
  
    // Initialize a Cropper instance for each selected image
   /* if(categoryForm && imageInputs){
    Array.from(imageInputs).forEach((input) => {
      const cropper = new Cropper(input, {
        aspectRatio: 1,
        viewMode: 2,
      });
  
      croppers.push(cropper);
    });
}
*/
if(imageInputs){
imageInputs.forEach((input) => {
    input.addEventListener('change', (event) => {
      const file = event.target.files[0];

      //for (let i = 0; i < files.length; i++) {
        //const file = files[i];

        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const image = new Image();
            image.src = e.target.result;

            const cropper = new Cropper(image, {
              aspectRatio: 1,
              viewMode: 2,
              background:false
            });

            //croppers.push(cropper);

            // Append the image to the container for display
            /imageContainer.appendChild(image);
          };
          reader.readAsDataURL(file);
        }
      }
    });}
    
  if(cropButton){
    cropButton.addEventListener('click', () => {
        console.log('cropbtn clicked')
      const croppedImagesData = [];
  
      // Loop through the Cropper instances and get cropped image data
      croppers.forEach((cropper) => {
        console.log('inside for crop button')
        const croppedCanvas = cropper.getCroppedCanvas();
  
        if (croppedCanvas) {
          const croppedImageData = croppedCanvas.toDataURL('image/jpeg');
          croppedImagesData.push(croppedImageData);
        }
      });
  
      // Attach the cropped image data to the form for submission
      const imagesInput = document.createElement('input');
      imagesInput.type = 'hidden';
      imagesInput.name = 'croppedImages';
      imagesInput.value = JSON.stringify(croppedImagesData);
      categoryForm.appendChild(imagesInput);
    });
}

  if(categoryForm){

    categoryForm.addEventListener('submit', async (e) => {
        console.log('form button clicked')
      e.preventDefault();
  
      const formData = new FormData(categoryForm);
  
      try {
        const response = await fetch('/admin/categories', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          // Handle a successful response (e.g., redirect or show a success message)
          console.log('Category added successfully.');
        } else {
          // Handle an error response (e.g., display an error message)
          console.error('Error adding category:', response.statusText);
        }
      } catch (error) {
        console.error('Error adding category:', error);
      }
    });
}