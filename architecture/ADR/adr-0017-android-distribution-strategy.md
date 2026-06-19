# ADR‑0017: Android Distribution Strategy

## Status
Proposed

## Context

The REI flagship Android application currently consumes Cedar design tokens through a manual copy-paste process from a legacy `cedar-release.aar` library. This process has several issues:

- **Manual friction:** Colors must be manually copied from the legacy AAR to the flagship project
- **Stale tokens:** The flagship app uses colors Cedar provided years ago, not current tokens
- **No automation:** No CI/CD pipeline for token updates
- **Team awareness gap:** Android team not aware of high spectrum color option
- **No dark mode:** No values-night directory or Compose color schemes
- **Framework mismatch:** Flagship uses Compose (primary) but colors consumed from XML resources

The Android team has expressed desire for automated library injection at build time to eliminate manual copy-paste and reduce maintenance overhead.

## Purpose

This ADR defines the automated distribution strategy for Cedar design tokens to Android applications, specifically addressing:

- CI/CD pipeline architecture for AAR library generation
- Maven/GitHub Packages distribution mechanism
- Gradle dependency integration
- Automated library injection at build time
- Migration path from manual copying to automated distribution

## Decision

### Distribution Mechanism: AAR Library via CI/CD

Cedar will distribute Android design tokens as an AAR (Android Archive) library through an automated CI/CD pipeline.

**Rationale:**
- AAR is the standard Android library format
- Supports both XML resources and Kotlin code
- Integrates seamlessly with Gradle dependency management
- Enables automated versioning and updates
- Reduces manual copy-paste friction

### CI/CD Pipeline Architecture

**Pipeline Steps:**

1. **Token Generation:** Style Dictionary generates Android resources from canonical tokens
2. **AAR Packaging:** Gradle packages resources into AAR library
3. **Version Management:** Semantic versioning based on token changes
4. **Publishing:** Publish to Maven/GitHub Packages repository
5. **Notification:** Notify consuming teams of new versions

**Example CI/CD Configuration:**

```yaml
# .gitlab-ci.yml
build-android-tokens:
  stage: build
  script:
    - npm ci
    - npm run build:android
    - cd dist/themes/rei-dot-com/android
    - ./gradlew assembleRelease
    - ./gradlew publishToMavenLocal
    - ./gradlew publish
  artifacts:
    paths:
      - dist/themes/rei-dot-com/android/build/outputs/aar/
  only:
    - main
```

**Gradle Build Configuration:**

```gradle
// build.gradle for token library
plugins {
    id 'com.android.library'
    id 'maven-publish'
}

android {
    namespace 'com.rei.cedar.tokens'
    compileSdk 35

    defaultConfig {
        minSdkVersion 30
        targetSdkVersion 35
    }
}

publishing {
    publications {
        maven(MavenPublication) {
            artifact("$buildDir/outputs/aar/android-tokens-release.aar")
            groupId = 'com.rei.cedar'
            artifactId = 'android-tokens'
            version = android.defaultConfig.versionName
        }
    }

    repositories {
        maven {
            url = "https://gitlab.com/api/v4/projects/<project_id>/packages/maven"
            credentials {
                username = gitLabPrivateToken
                password = gitLabPrivateToken
            }
        }
    }
}
```

### Maven/GitHub Packages Distribution

**Repository Options:**

1. **GitLab Packages** (Recommended for REI)
   - Private repository
   - Integrated with GitLab CI/CD
   - Access control via GitLab permissions
   - Already used for other REI Android libraries

2. **GitHub Packages**
   - Private repository
   - Integrated with GitHub Actions
   - Access control via GitHub permissions

3. **Maven Central**
   - Public repository
   - Not suitable for internal Cedar tokens
   - Would expose design system publicly

**Decision:** Use GitLab Packages for private distribution within REI.

### Gradle Dependency Integration

**Consuming Library in Flagship App:**

```gradle
// flagship/build.gradle
dependencies {
    implementation 'com.rei.cedar:android-tokens:1.0.0'
}
```

**Version Management:**

- Use semantic versioning (major.minor.patch)
- Major version: Breaking changes to token names or structure
- Minor version: New tokens or non-breaking additions
- Patch version: Token value updates only

**Automated Version Updates:**

```gradle
// build.gradle with dynamic version
dependencies {
    implementation 'com.rei.cedar:android-tokens:latest.release'
}
```

### Automated Library Injection at Build Time

**Build-Time Integration:**

The AAR library is automatically resolved and included in the build process by Gradle. No manual intervention required after initial dependency declaration.

**Build Process Flow:**

1. Gradle resolves dependency from GitLab Packages
2. AAR is downloaded and extracted to build cache
3. XML resources are merged into res/values/
4. Kotlin code is compiled into the application
5. Tokens are available at runtime via resource references

**No Build-Time Injection Required:**

Unlike some approaches that inject code at build time, the AAR approach uses standard Gradle dependency resolution. The "injection" happens automatically as part of the standard Android build process.

### Dual Framework Support

**XML Resources (for Views):**

```xml
<!-- res/values/colors.xml from AAR -->
<resources>
    <color name="cdr_color_surface_base">#FFFFFF</color>
    <color name="cdr_color_text_primary">#1A1A1A</color>
</resources>
```

**Compose Color Schemes (for Compose):**

```kotlin
// CedarColors.kt from AAR
object CedarColors {
    val SurfaceBase = Color(0xFFFFFFFF)
    val TextPrimary = Color(0xFF1A1A1A)
}
```

**Decision:** Generate both XML resources and Compose color schemes in the AAR to support both frameworks.

### Color Space Strategy

**Initial Implementation (Q3 2026):**

- Generate sRGB values for broad compatibility
- Match current flagship implementation
- Ensure immediate adoption without breaking changes

**Future Enhancement (Q4 2026):**

- Add high spectrum color support as opt-in
- Generate both sRGB and high spectrum variants
- Document device capability matrix
- Educate Android team on visual differences

**Rationale:** Start with sRGB to match current implementation, then add high spectrum as an enhancement after education and demonstration.

### Dark Mode Support

**Implementation:**

```xml
<!-- res/values/colors.xml (light mode) -->
<resources>
    <color name="cdr_color_surface_base">#FFFFFF</color>
</resources>

<!-- res/values-night/colors.xml (dark mode) -->
<resources>
    <color name="cdr_color_surface_base">#000000</color>
</resources>
```

**Compose Color Schemes:**

```kotlin
// CedarColors.kt with dark mode support
object CedarColors {
    val SurfaceBase
        @Composable
        get() = if (isSystemInDarkTheme()) {
            Color(0xFF000000)
        } else {
            Color(0xFFFFFFFF)
        }
}
```

**Decision:** Implement values/values-night for XML resources and Compose color schemes with dark mode support.

## Implementation Phases

### Phase 1: CI/CD Pipeline Setup (Immediate)

**Tasks:**
1. Set up Style Dictionary configuration for Android output
2. Create Gradle build configuration for AAR packaging
3. Configure GitLab CI/CD pipeline
4. Set up GitLab Packages repository
5. Test end-to-end token generation and publishing

**Deliverables:**
- Working CI/CD pipeline
- Published AAR library (version 0.1.0)
- Documentation for integration

### Phase 2: Flagship Integration (Q3 2026)

**Tasks:**
1. Add Gradle dependency to flagship app
2. Replace manual color copying with AAR dependency
3. Update color references to use new token names
4. Test build and runtime behavior
5. Remove legacy cedar-release.aar dependency

**Deliverables:**
- Flagship app consuming AAR library
- Removed manual copy-paste process
- Migration documentation

### Phase 3: Dark Mode Implementation (Q3 2026)

**Tasks:**
1. Generate values-night directory
2. Implement Compose color schemes with dark mode
3. Test dark mode behavior in flagship app
4. Document dark mode integration

**Deliverables:**
- Dark mode support in AAR library
- Compose color schemes
- Dark mode integration guide

### Phase 4: High Spectrum Support (Q4 2026)

**Tasks:**
1. Demonstrate high spectrum vs sRGB differences
2. Educate Android team on benefits
3. Add high spectrum color generation
4. Generate dual color space variants
5. Document device capability matrix

**Deliverables:**
- High spectrum color support
- Visual demonstration
- Device capability documentation
- Education materials

### Phase 5: Compose Integration (Q1 2027)

**Tasks:**
1. Prioritize Compose color scheme generation
2. Encourage migration from XML to Compose
3. Document Compose integration patterns
4. Deprecate XML resource generation

**Deliverables:**
- Compose-first color scheme generation
- Compose integration guide
- Deprecation notice for XML resources

## Migration Strategy

### From Manual Copying to Automated Distribution

**Step 1: Parallel Operation (Immediate)**
- Continue manual copying for flagship app
- Set up automated AAR distribution
- Test AAR in separate branch

**Step 2: Flagship Migration (Q3 2026)**
- Add AAR dependency to flagship app
- Update color references incrementally
- Test thoroughly before removing manual copying
- Remove manual copy-paste process

**Step 3: Legacy Cleanup (Q4 2026)**
- Remove legacy cedar-release.aar
- Remove manual color copying scripts
- Document migration completion

### From sRGB to High Spectrum

**Step 1: Education (Q4 2026)**
- Demonstrate visual differences
- Document device capability matrix
- Educate Android team

**Step 2: Dual Support (Q1 2027)**
- Generate both sRGB and high spectrum variants
- Allow teams to choose color space
- Document selection criteria

**Step 3: High Spectrum Default (Q2 2027)**
- Make high spectrum default for new projects
- Maintain sRGB fallback for older devices
- Deprecate sRGB-only generation

## Non-Goals

This ADR does not address:

- **Runtime palette switching:** Build-time appearance selection is sufficient for current use cases
- **Token generation logic:** That's covered by ADR-0005 (Transform Layer)
- **Canonical token model:** That's covered by ADR-0001 (Canonical Token Model)
- **Figma integration:** Figma sync-back is out of scope for Android distribution

## Related Documents

- ADR-0005: Transform Layer & Platform Outputs
- ADR-0013: Consumer Models
- Cedar Native Color Support Discovery v3
- Mobile Team Discovery Findings
- Flagship Android Project Analysis
