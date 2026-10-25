# 📱 Building the Android APK for SwissNat SL

SwissNat SL is built as a hybrid cross-platform application using **Capacitor Android** (`com.swissnatsl.app`). You can easily compile and generate the Android `.apk` package to install on any Android phone or tablet.

---

## 🛠️ Prerequisites

1. **Java JDK 17 or higher** (JDK 19 is already installed on your system).
2. **Android Studio** (Recommended) or **Android SDK Command-Line Tools**:
   - Download free: [developer.android.com/studio](https://developer.android.com/studio)

---

## ☁️ Method 0: Automatic Cloud Build via GitHub Actions (Recommended & Zero Setup)

SwissNat SL includes a configured GitHub Actions workflow (`.github/workflows/build-apk.yml`).

- **Automatic**: Every push to `main` or release tag compiles the Android APK in the GitHub cloud runner.
- **Direct Download Link**: The latest APK is published automatically to GitHub Releases:
  ```
  https://github.com/ssg1113/SwissNat-SL/releases/latest/download/SwissNat-SL.apk
  ```
- **Manual Trigger**: Go to your GitHub repository &rarr; **Actions** &rarr; select **Build & Release Android APK** &rarr; click **Run workflow**.

---

## 🚀 Method 1: Build Using Android Studio (Recommended for Local Dev)

Android Studio automatically manages Android SDKs, build-tools, and provides visual APK generation.

### Step 1: Sync Web Assets to Android
In your project terminal, run:
```bash
npm run build:mobile
```
*(This builds the React web app and syncs all HTML/JS/CSS assets and icons into the Android project)*

### Step 2: Open Project in Android Studio
Run the open command:
```bash
npm run open:android
```
*Alternatively, launch Android Studio manually, choose **Open**, and select the `d:\SwissNat SL\android` folder.*

### Step 3: Build the APK
1. Wait a moment for Android Studio and Gradle to complete the initial project sync.
2. In the top menu bar, click:
   **Build** &rarr; **Build Bundle(s) / APK(s)** &rarr; **Build APK(s)**
3. When the build finishes (usually within 1–2 minutes), a notification will pop up in the bottom-right corner saying **"APK(s) generated successfully"**.
4. Click the blue **locate** link in that notification to open the folder containing your APK!

📍 **APK Output Location:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ⚡ Method 2: Command-Line 1-Click Build (Batch Script)

If you have the Android SDK configured in your system environment (`ANDROID_HOME`), you can build the APK directly without opening Android Studio.

### Option A: Double-Click the Batch File
Double-click `build-apk.bat` in the project root:
```
d:\SwissNat SL\build-apk.bat
```

### Option B: Run npm Command
In your PowerShell or Command Prompt terminal:
```bash
npm run build:apk
```

This single command will:
1. Compile and bundle the latest web assets (`npm run build`).
2. Sync assets with Capacitor (`npx cap sync android`).
3. Invoke Gradle to assemble the APK (`gradlew.bat assembleDebug`).

---

## 🔐 Method 3: Building a Release (Production) APK

For sharing official builds without a debug certificate:

1. **In Android Studio**:
   - Top menu: **Build** &rarr; **Generate Signed Bundle / APK...**
   - Select **APK**, choose or create your keystore file, select `release`, and click **Finish**.
2. **Via Command Line**:
   ```bash
   npm run build:apk:release
   ```
   *(Generates `android/app/build/outputs/apk/release/app-release-unsigned.apk`)*

---

## 📲 How to Install the APK on Your Android Phone or Tablet

1. **Transfer the APK**:
   - Send `app-debug.apk` to your phone via **WhatsApp**, **Telegram**, **Google Drive**, **USB cable**, or email.
2. **Allow Installation**:
   - When tapping the APK file on your device, Android may ask: *"For your security, your phone is not allowed to install unknown apps from this source"*.
   - Tap **Settings** &rarr; toggle on **Allow from this source**.
3. **Install**:
   - Tap **Install**.
   - SwissNat SL will now appear on your home screen and in your app drawer with its official icon and full-screen touch experience!
