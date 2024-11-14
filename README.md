# Wikipedia Search

This Angular application provides a Wikipedia autocomplete search to help you quickly find information and navigate to original Wikipedia pages.

## 🌐 Live Demo

Check out the live version here: [Wikipedia Content Search](https://wikipedia-content-search.vercel.app)

## 🚀 Getting Started

If you'd like to run this project locally, follow these steps:

1. **Clone the repository:**

   ```sh
   git clone https://github.com/irowbin/wikipedia-search.git
   ```

2. **Navigate to the project directory:**

   ```sh
   cd wikipedia-search
   ```

3. **Install the dependencies:**

   ```sh
   npm install
   ```

4. **Run the application:**

   ```sh
   nx serve
   ```

   The app should now be running at `http://localhost:4200/`.

## ✨ Features

- **Live Wikipedia Search:** Start typing, and the app displays search results in real-time to help you find information quickly.
- **Infinite Scrolling with Virtualization:** To keep the UI smooth and responsive, only 10 items are rendered in the viewport at a time. As you scroll, the next 100 items are loaded and appended to the list.
- **Easy Navigation:** Click on any suggestion to navigate directly to the original Wikipedia page.

## 🛠 Technologies Used

- **Node.js** (version 20 or higher)
- **Nx:** A smart build system with first-class monorepo support ([nx.dev](https://nx.dev/))
- **Angular:** A platform for building mobile and desktop web applications ([angular.io](https://angular.io/))
- **NgRx:** Reactive state management for Angular ([ngrx.io](https://ngrx.io/))
- **Tailwind CSS:** A utility-first CSS framework ([tailwindcss.com](https://tailwindcss.com/))
- **Tailwind UI Components:** Leveraged components from [HyperUI](https://www.hyperui.dev/) and [Creative Tim](https://www.creative-tim.com/twcomponents/component/autocomplete-with-perks)
- **Google Roboto Font:** For clean and modern typography ([Google Fonts](https://fonts.google.com/specimen/Roboto))

## 📄 Available Scripts

In addition to `nx serve`, there are other scripts you might find useful:

- **Build the project:**

  ```sh
  nx build # outputs to dist/
  ```

- **Run unit tests:**

  ```sh
  nx test # to run all tests currently used jest
  ```

- **Lint the code:**

  ```sh
  nx lint --fix # to automatically fix linting issues
  ```

For more commands and detailed options, you can refer to the [Nx documentation](https://nx.dev).

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements or run into issues, feel free to open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
