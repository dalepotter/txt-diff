# Text Diff Checker: A local text comparison tool

A simple, lightweight **text comparison tool** built with HTML, CSS, and JavaScript.

Compares two blocks of text and highlights the differences: green for additions, red for removals, and grey for unchanged lines.  
Inspired by tools like [Diffchecker](https://www.diffchecker.com/), but runs entirely in the browser with zero requests on submit.


## 🛠 Features

- Compare two text inputs, side-by-side.
- Colour-coded highlights for added, removed, and unchanged lines.
- Runs entirely in the browser: No backend required.
- Simple UI for desktop and mobile.


## 💻 Usage

1. Clone the repo:
   ```bash
   git clone git@github.com:dalepotter/txt-diff.git
   cd txt-diff
   ```
2. You don’t need any build tools — just open `index.html` in your browser.

If you want a quick local server:
```bash
# Python 3
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

## 🛠 How to Use

1. Enter your original text in the **left** textarea.
2. Enter the modified text in the **right** textarea.
3. Click **Compare** to see the differences highlighted below.


## 📁 Project Structure

```bash
txt-diff/
├── index.html # Main HTML file (including JS and CSS)
```


## 📋 Todos
- Deploy to GitHub Actions
- Package and build using npm & webpack
- Add side-by-side comparison
- Add word diff
