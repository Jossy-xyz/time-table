# Backend Development Guide

## Automatic Restart (Nodemon-like functionality)

We have configured `spring-boot-devtools` to provide automatic restarts when code changes are detected. This is similar to `nodemon` in the Node.js ecosystem.

### How to use it

There are two main ways to trigger automatic restarts:

#### 1. Using Gradle Continuous Build (Recommended for Terminal Users)

If you run the application from the terminal, use the `--continuous` (or `-t`) flag. This tells Gradle to watch your source files, recompile them when they change, and then `spring-boot-devtools` will pick up the changes and restart the server.

```bash
# Windows
./gradlew bootRun --continuous

# Mac/Linux
./gradlew bootRun --continuous
```

**Workflow:**

1. Run the command above.
2. **Stopping:** To stop the server manually, press `Ctrl + C`.
3. **Restarting:** You do **not** need to manually stop and start.
   - Edit a Java file and save it.
   - Gradle **automatically stops** the current application and starts a new one (similar to Nodemon).

#### 2. Using an IDE (IntelliJ IDEA, Eclipse)

If you are running the application via your IDE:

1. Run the `bootRun` task or the items Application configuration.
2. When you make a change, you must **Build/Compile** the project.
   - **IntelliJ**: Press `Ctrl + F9` (Build Project).
   - **Eclipse**: usually builds automatically on save.

Once the compilation finishes, DevTools detects the updated class files and restarts the application automatically.

### Scope of Changes (What triggers what?)

When running with `./gradlew bootRun --continuous`, different file types trigger different actions:

#### 1. Full Server Restart

The entire Spring Boot application context is stopped and restarted. This is equivalent to a "Nodemon" restart.

- **Java Files:** Any change in `src/main/java/**/*`
- **Config Files:** `src/main/resources/application.properties` or `application.yml`.
- **Global Resources:** Any file in `src/main/resources/` **except** those in the "LiveReload" paths below.

#### 2. LiveReload (Browser Refresh Only)

The server **does not restart**. Instead, it triggers a refresh in your browser (if using the LiveReload extension).

- `src/main/resources/static/**`
- `src/main/resources/public/**`
- `src/main/resources/templates/**`
- `src/main/resources/META-INF/resources/**`

### LiveReload Extension

`spring-boot-devtools` includes a LiveReload server. To take advantage of the "Browser Refresh Only" behavior, you should install the **LiveReload** extension for Chrome or Firefox.
