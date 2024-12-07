import { db, collection, getDocs, query, orderBy } from './firebase.js';
// Ensure the DOM is fully loaded before executing
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector('form');

  let loggedInUserName = "Anonymous"; // Default user name

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const userNameInput = document.getElementById("userNameInput").value;
      loggedInUserName = userNameInput || "Anonymous"; // Set logged-in name or default to "Anonymous"
    });
  }

  // Redirect to signup page when 'registerBtn' is clicked
  document.getElementById("registerBtn").addEventListener("click", function (event) {
    event.preventDefault();  // Prevents default anchor behavior
    window.location.href = "signup.html";  // Redirect to the signup page
  });

  // Import Firestore utilities from firebase.js
 

  const blogPostsContainer = document.getElementById('blog-posts');

  // Function to display blog posts
  const displayPosts = (posts) => {
    // Clear previous posts before rendering new ones
    blogPostsContainer.innerHTML = '';

    // Iterate over each post and create its HTML structure
    posts.forEach((data) => {
      // Format createdAt (timestamp) to a human-readable date
      const createdAt = data.createdAt.toDate();
      const formattedDate = createdAt.toLocaleDateString() + ' at ' + createdAt.toLocaleTimeString();

      // Create post element and inject the data
      const postElement = document.createElement('div');
      postElement.classList.add('card', 'mb-4');
      postElement.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${data.title}</h5>
          <p class="card-text">${data.description}</p>
          <p><small class="text-muted">By ${data.userName || loggedInUserName} • ${formattedDate} • ${data.category}</small></p>
          <a href="#" class="btn btn-outline-primary">Read More</a>
        </div>
      `;
      // Append each post to the container
      blogPostsContainer.appendChild(postElement);
    });
  };

  // Fetch blog posts from Firestore
  const fetchBlogPosts = async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));  // Query posts ordered by createdAt
      const querySnapshot = await getDocs(q);  // Get documents from Firestore

      // Create an array to hold all the posts
      const posts = [];

      // Iterate over each document and push the data to the posts array
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push(data);  // Add the post data to the posts array
      });

      // Now display the posts
      displayPosts(posts);  // Pass the posts array to displayPosts function
    } catch (error) {
      console.error("Error fetching blog posts: ", error);
    }
  };

  // Call fetchBlogPosts to load posts when the page is ready
  fetchBlogPosts();
});
