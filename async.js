const usersDiv = document.querySelector(".users");
const ulEl = document.getElementById("users-list");
const loadingEl = document.getElementById("loading");
const info = document.querySelector(".info");

const saveToLocalStorage = (data) => {
  localStorage.setItem("users", JSON.stringify(data));
};

const getDataFromLocalStorage = () => JSON.parse(localStorage.getItem("users"));

const hideLoading = () => {
  loadingEl.style.display = "none";
};

const showLoading = () => {
  loadingEl.style.display = "block";
};

const fetchUsersToCache = async () => {
  const res = await fetch("./data.json");
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  saveToLocalStorage(data.users);
};

const removeAllUsers = () => {
  localStorage.removeItem("users");
  hideLoading(); // We hide usersDiv after deleting all users so we do not need to show loader we only give choice to reolad the page
  usersDiv.classList.add("users--hidden");
  info.classList.add("info--shown");
  info.querySelector(".info__btn").addEventListener("click", () => {
    info.classList.remove("info--shown");
    showLoading();
    renderList();
  });
};

const renderListItem = ({ id, name, surname, email, age }) => {
  const liEl = document.createElement("li");
  liEl.innerHTML = `
    <p>${name}</p>
    <p>${surname}</p>
    <p>${email}</p>
    <p>${age}</p>
    <button class="delete-user-btn">Delete user</button>
  `;

  liEl.querySelector(".delete-user-btn").addEventListener("click", () => {
    const dataFromLocalStorage = getDataFromLocalStorage();
    const filteredData = dataFromLocalStorage.filter((item) => item.id !== id);

    // If we are deleting the last user so this is like we deleting all users, we clear localStorage and give a chance to reload the page to refetch users from data.json
    if (filteredData.length === 0) {
      removeAllUsers();
    } else {
      saveToLocalStorage(filteredData);
      renderList();
    }
    liEl.remove();
  });

  ulEl.appendChild(liEl);
};

const renderList = () => {
  ulEl.innerHTML = "";
  const usersFromStorage = getDataFromLocalStorage();
  if (usersFromStorage) {
    usersFromStorage.forEach(renderListItem);
    hideLoading();
    usersDiv.classList.remove("users--hidden");
    usersDiv
      .querySelector(".delete-all-users")
      .addEventListener("click", () => removeAllUsers());
  } else {
    setTimeout(() => {
      fetchUsersToCache()
        .then(() => getDataFromLocalStorage())
        .then(() => renderList())
        .catch((error) => {
          hideLoading();
          const errorEl = document.createElement("div");
          errorEl.classList.add("error");
          errorEl.innerHTML = `
            <span>${error} :(</span>
            <button>try again</button>
          `;

          errorEl.querySelector("button").addEventListener("click", () => {
            errorEl.remove();
            showLoading();
            renderList();
          });
          document.body.appendChild(errorEl);
        });
    }, 3000);
  }
};

renderList();
