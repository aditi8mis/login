fetch("http://localhost:5000/api/feedback")
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("feedbackList");

    if (data.length === 0) {
      list.innerHTML = "<p>No feedback yet.</p>";
      return;
    }

    data.forEach(fb => {
      const div = document.createElement("div");
      div.className = "feedback-card";
      div.innerHTML = `
        <h3>${fb.userName}</h3>
        <p>⭐ ${fb.rating}/5</p>
        <p>${fb.message}</p>
        <hr/>
      `;
      list.appendChild(div);
    });
  })
  .catch(() => {
    document.getElementById("feedbackList").innerText =
      "Unable to load feedback.";
  });
