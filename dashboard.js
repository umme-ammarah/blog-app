import {
    doc, setDoc, collection, addDoc,
    updateDoc, deleteDoc, db
  } from "./firebase.js";
  
  let loggedInUserName = localStorage.getItem("userName") || "Anonymous"; // Default to "Anonymous" if no name is found
  let profilePhotoUrl = localStorage.getItem("profilePhoto") || "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"; // Default profile photo if none
  
  // This part ensures that the profile photo and input logic works on page load
  if (document.getElementById("post")) { 
    const profilePhotoImg = document.getElementById("profilePhotoImg");
    profilePhotoImg.src = profilePhotoUrl; // Set the profile photo
  
    const profilePhotoInput = document.getElementById("profilePhotoInput");
  
    profilePhotoImg.addEventListener("click", () => {
      profilePhotoInput.click();
    });
  
    profilePhotoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        profilePhotoImg.src = reader.result; // Update the image with the uploaded one
        // Optionally, save the uploaded photo URL to localStorage
        localStorage.setItem("profilePhoto", reader.result);
      };
      reader.readAsDataURL(file);
    });
  
    var backgroundImg;
  
    // The function to create a post
    window.createPost = async function () {
      var title = document.getElementById("title");
      var description = document.getElementById("description");
      var categoryElement = document.getElementById("category"); // Get category input element
      var category = categoryElement.value; // Get the selected category
      var currentTime = new Date().toLocaleTimeString();
      var userName = loggedInUserName; // Use logged-in user's name
  
      // Log the values to debug
      console.log("Title:", title.value);
      console.log("Description:", description.value);
  
      // Check if title and description are filled
      if (title && title.value.trim() && description && description.value.trim()) {
        // Add the post data to Firestore
        try {
          const docRef = await addDoc(collection(db, "blogs"), {
            title: title.value.trim(), // Ensure no extra spaces
            description: description.value.trim(), // Ensure no extra spaces
            category: category,
            userName: userName,
            createdAt: new Date(), // Save the creation time of the post
          });
          console.log("Document written with ID: ", docRef.id);
  
          // Now, update the UI with the new post
          var postContainer = document.getElementById("post");
          postContainer.innerHTML += `
            <div class="card p-2 mb-2" data-id="${docRef.id}">
              <div class="card-header d-flex justify-content-between">
                <div class="d-flex">
                  <img class="profile-photo me-2" src="${profilePhotoImg.src}" />
                  <div class="name-time d-flex flex-column">
                    <span>${userName}</span>
                    <span class="text-muted time">${currentTime}</span>
                  </div>
                </div>
                <strong class="category text-muted">Category: ${category}</strong>
              </div>
              <div style="background-image: url(${backgroundImg})" class="card-body">
                <blockquote class="blockquote mb-0">
                  <p>${title.value}</p>
                  <footer class="blockquote-footer">${description.value}</footer>
                </blockquote>
              </div>
              <div class="card-footer d-flex justify-content-end">
                <button type="button" onclick="editPost(this)" class="ms-2 btn editBtn">Edit</button>
                <button type="button" onclick="deletePost(this)" class="ms-2 btn btn-danger deleteBtn">Delete</button>
              </div>
            </div>`;
  
          // Reset fields after adding post to UI
          title.value = "";
          description.value = "";
          categoryElement.selectedIndex = 0; // Reset category dropdown to default
        } catch (error) {
          console.log("Error adding document: ", error);
        }
      } else {
        Swal.fire({
          title: "Empty Post",
          text: "Can't publish post without Title or Description",
          icon: "question",
        });
      }
    };
  
    // Function to handle image selection for background
    function selectImg(src) {
      backgroundImg = src;
      var bgImg = document.getElementsByClassName("bg-img");
  
      for (var i = 0; i < bgImg.length; i++) {
        bgImg[i].className = "bg-img";
      }
      event.target.className += " selectedImg";
    }
  
    // Add the functions to the window object to make them globally available
    window.deletePost = async function (button) {
      var postElement = button.parentNode.parentNode;
      var postId = postElement.getAttribute("data-id");
  
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, "blogs", postId));
        console.log("Document successfully deleted from Firestore");
  
        // Remove from the DOM
        postElement.remove();
      } catch (error) {
        console.log("Error deleting document: ", error);
      }
    }
  
    window.editPost = async function (button) {
      var postElement = button.parentNode.parentNode;
      var postId = postElement.getAttribute("data-id");
  
      // Extract post content from DOM
      var title = postElement.querySelector(".blockquote p").innerHTML;
      var description = postElement.querySelector(".blockquote-footer").innerHTML;
      var category = postElement.querySelector(".category").innerHTML.replace("Category: ", ""); // Extract category
      document.getElementById("title").value = title;
      document.getElementById("description").value = description;
      document.getElementById("category").value = category;
  
      // Remove post from UI (it will be updated after saving changes)
      postElement.remove();
  
      // Save post data to a hidden field or global variable for later reference
      localStorage.setItem("editingPostId", postId);
    }
  
    // Function to save the updated post
    window.saveUpdatedPost = async function () {
      var postId = localStorage.getItem("editingPostId");
      var title = document.getElementById("title");
      var description = document.getElementById("description");
      var categoryElement = document.getElementById("category");
      var category = categoryElement.value;
  
      if (title && title.value.trim() && description && description.value.trim()) {
        try {
          // Update the post in Firestore
          const postRef = doc(db, "blogs", postId);
          await updateDoc(postRef, {
            title: title.value.trim(),
            description: description.value.trim(),
            category: category,
          });
          console.log("Document successfully updated");
  
          // Update the UI accordingly after editing
          var postContainer = document.getElementById("post");
          postContainer.innerHTML += `
            <div class="card p-2 mb-2" data-id="${postId}">
              <div class="card-header d-flex justify-content-between">
                <div class="d-flex">
                  <img class="profile-photo me-2" src="${profilePhotoImg.src}" />
                  <div class="name-time d-flex flex-column">
                    <span>${loggedInUserName}</span>
                    <span class="text-muted time">${new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                <strong class="category text-muted">Category: ${category}</strong>
              </div>
              <div class="card-body">
                <blockquote class="blockquote mb-0">
                  <p>${title.value}</p>
                  <footer class="blockquote-footer">${description.value}</footer>
                </blockquote>
              </div>
              <div class="card-footer d-flex justify-content-end">
                <button type="button" onclick="editPost(this)" class="ms-2 btn editBtn">Edit</button>
                <button type="button" onclick="deletePost(this)" class="ms-2 btn btn-danger deleteBtn">Delete</button>
              </div>
            </div>`;
  
          // Reset fields after updating post
          title.value = "";
          description.value = "";
          categoryElement.selectedIndex = 0;
        } catch (error) {
          console.log("Error updating document: ", error);
        }
      } else {
        Swal.fire({
          title: "Empty Post",
          text: "Can't update post without Title or Description",
          icon: "question",
        });
      }
    };
  }
  