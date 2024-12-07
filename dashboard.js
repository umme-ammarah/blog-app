import {
    doc,
    setDoc,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    db,
    getDocs, // Use getDocs for fetching multiple documents
  } from "./firebase.js";
  
  let loggedInUserName =
    localStorage.getItem("userName") || "Anonymous";
  let profilePhotoUrl =
    localStorage.getItem("profilePhoto") ||
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";
  
  // DOM Manipulation Logic
  if (document.getElementById("post")) {
    const profilePhotoImg = document.getElementById("profilePhotoImg");
    profilePhotoImg.src = profilePhotoUrl;
  
    const profilePhotoInput =
    document.getElementById("profilePhotoInput");
    profilePhotoImg.addEventListener("click", () => {
      profilePhotoInput.click();
    });
  
    profilePhotoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        profilePhotoImg.src = reader.result;
        localStorage.setItem("profilePhoto", reader.result);
      };
      reader.readAsDataURL(file);
    });
  
    // Function to fetch and display posts from Firestore
    const displayPosts = async () => {
      const postContainer = document.getElementById("post");
      postContainer.innerHTML = ''; // Clear existing posts
  
      try {
        // Use getDocs to fetch all posts from the "blogs" collection
        const querySnapshot = await getDocs(collection(db, "blogs"));
        
        if (querySnapshot.empty) {
          console.log("No posts available.");
          postContainer.innerHTML = "<p>No posts available.</p>";
          return;
        }
        
        // Loop through each post in the collection
        querySnapshot.forEach((doc) => {
          const postData = doc.data();
          const postId = doc.id;
          console.log(postData);  // Log data for debugging
  
          const currentTime = new Date(postData.createdAt.seconds * 1000).toLocaleTimeString(); // Convert timestamp to time string
  
          postContainer.innerHTML += `
            <div class="card p-2 mb-2" data-id="${postId}">
              <div class="card-header d-flex justify-content-between">
                <div class="d-flex">
                  <img class="profile-photo me-2" src="${profilePhotoUrl}" />
                  <div class="name-time d-flex flex-column">
                    <span>${postData.userName}</span>
                    <span class="text-muted time">${currentTime}</span>
                  </div>
                </div>
                <strong class="category text-muted">Category: ${postData.category}</strong>
              </div>
              <div class="card-body">
                <blockquote class="blockquote mb-0">
                  <p>${postData.title}</p>
                  <footer class="blockquote-footer">${postData.description}</footer>
                </blockquote>
              </div>
              <div class="card-footer d-flex justify-content-end">
                <button type="button" onclick="editPost(this)" class="ms-2 btn editBtn">Edit</button>
                <button type="button" onclick="deletePost(this)" class="ms-2 btn btn-danger deleteBtn">Delete</button>
              </div>
            </div>`;
        });
      } catch (error) {
        console.error("Error fetching posts:", error.message);  // Log error message for debugging
        Swal.fire({
          title: "Error",
          text: "An error occurred while fetching posts.",
          icon: "error",
        });
      }
    };
  
    // Call displayPosts to fetch and show posts when page loads
    displayPosts();
  
    // Function to create or update a post
    window.createOrUpdatePost = async function () {
      const title = document.getElementById("title").value.trim();
      const description = document.getElementById("description").value.trim();
      const categoryElement = document.getElementById("category");
      const category = categoryElement.value;
      const currentTime = new Date().toLocaleTimeString();
  
      const postId = localStorage.getItem("editingPostId") || null;
  
      if (!title || !description) {
        Swal.fire({
          title: "Empty Fields",
          text: "Please ensure all fields are filled out.",
          icon: "error",
        });
        return;
      }
  
      try {
        // Use `setDoc` to either create or update the post
        const docRef = postId
          ? doc(db, "blogs", postId) // For update, use existing ID
          : doc(collection(db, "blogs")); // For new post, generate new ID
  
        await setDoc(docRef, {
          title,
          description,
          category,
          userName: loggedInUserName,
          createdAt: new Date(),
        });
  
        const postContainer = document.getElementById("post");
  
        if (postId) {
          // Update the DOM for the edited post
          const postElement = document.querySelector(
            `.card[data-id="${postId}"]`
          );
          if (postElement) {
            postElement.querySelector(
              ".blockquote p"
            ).textContent = title;
            postElement.querySelector(
              ".blockquote-footer"
            ).textContent = description;
            postElement.querySelector(
              ".category"
            ).textContent = `Category: ${category}`;
          }
          Swal.fire({
            title: "Post Updated",
            text: "Your post has been successfully updated!",
            icon: "success",
          });
        } else {
          // Add a new post to the DOM
          postContainer.innerHTML += `
            <div class="card p-2 mb-2" data-id="${docRef.id}">
              <div class="card-header d-flex justify-content-between">
                <div class="d-flex">
                  <img class="profile-photo me-2" src="${profilePhotoUrl}" />
                  <div class="name-time d-flex flex-column">
                    <span>${loggedInUserName}</span>
                    <span class="text-muted time">${currentTime}</span>
                  </div>
                </div>
                <strong class="category text-muted">Category: ${category}</strong>
              </div>
              <div class="card-body">
                <blockquote class="blockquote mb-0">
                  <p>${title}</p>
                  <footer class="blockquote-footer">${description}</footer>
                </blockquote>
              </div>
              <div class="card-footer d-flex justify-content-end">
                <button type="button" onclick="editPost(this)" class="ms-2 btn editBtn">Edit</button>
                <button type="button" onclick="deletePost(this)" class="ms-2 btn btn-danger deleteBtn">Delete</button>
              </div>
            </div>`;
          Swal.fire({
            title: "Post Created",
            text: "Your post has been successfully created!",
            icon: "success",
          });
        }
  
        // Clear input fields and reset localStorage
        localStorage.removeItem("editingPostId");
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        categoryElement.selectedIndex = 0;
  
        // Reload posts after adding/updating
        displayPosts();
      } catch (error) {
        console.error("Error saving post:", error);
        Swal.fire({
          title: "Error",
          text: "An error occurred while saving your post.",
          icon: "error",
        });
      }
    };
  
    // Function to delete a post with SweetAlert2 confirmation
    window.deletePost = async function (button) {
      const postElement = button.parentNode.parentNode;
      const postId = postElement.getAttribute("data-id");
  
      // SweetAlert2 confirmation before deleting the post
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to undo this action!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        width: '300px',  // Set width for smaller box
        padding: '10px',
        customClass: {
          popup: 'small-alert-popup' // Custom class for small alert styling
        }
      });
  
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "blogs", postId));
          postElement.remove();
          console.log("Document successfully deleted.");
          Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
  
          // Reload posts after deletion
          displayPosts();
        } catch (error) {
          console.error("Error deleting document: ", error);
        }
      } else {
        console.log("Post deletion canceled.");
      }
    };
  
    // Function to edit a post
    window.editPost = function (button) {
      const postElement = button.parentNode.parentNode;
      const postId = postElement.getAttribute("data-id");
  
      const title = postElement.querySelector(
        ".blockquote p"
      ).textContent;
      const description = postElement.querySelector(
        ".blockquote-footer"
      ).textContent;
      const category = postElement
        .querySelector(".category")
        .textContent.replace("Category: ", "");
  
      localStorage.setItem("editingPostId", postId);
      document.getElementById("title").value = title;
      document.getElementById("description").value = description;
      document.getElementById("category").value = category;
    };
  }
  