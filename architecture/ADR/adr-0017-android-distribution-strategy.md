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

**Jetpack Compose (Primary):**

```kotlin
// CedarColors.kt from AAR
object CedarColors {
    val SurfaceBase = Color(0xFFFFFFFF)
    val TextPrimary = Color(0xFF1A1A1A)
}
```

**XML Resources (Legacy Compatibility):**

```xml
<!-- res/values/colors.xml from AAR -->
<resources>
    <color name="cdr_color_surface_base">#FFFFFF</color>
    <color name="cdr_color_text_primary">#1A1A1A</color>
</resources>
```

**Decision:** Generate Compose color schemes as the primary output with XML resources for legacy Views compatibility. The flagship Android application already uses Jetpack Compose, positioning Cedar to provide modern, forward-looking color support.

### Color Space Strategy

**Leadership Opportunity:**

The Android team is not rejecting modern color support—they simply haven't evaluated it yet. Cedar has an opportunity to lead by providing wide-gamut OKLCH color support for Android, aligning with Cedar's color architecture work and positioning Cedar as a forward-looking design system.

**Implementation:**

- Generate wide-gamut OKLCH color values for modern devices
- Provide sRGB fallback for legacy device compatibility
- Align with Cedar's color architecture work
- Document device capability matrix for wide-gamut support
- Enable automatic color space selection based on device capability

**Rationale:** Cedar provides wide-gamut OKLCH color support as a leadership initiative to demonstrate Cedar's forward-looking approach to Android color support, aligning with the broader Cedar color architecture work. sRGB fallback ensures compatibility with legacy devices that don't support wide-gamut.

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

### Phase 2: Compose-First Implementation (Immediate)

**Tasks:**
1. Generate Compose color schemes as primary output
2. Generate XML resources for legacy Views compatibility
3. Implement dark mode support for Compose
4. Test Compose integration in flagship app
5. Document Compose integration patterns

**Deliverables:**
- Compose color schemes in AAR library
- XML resources for legacy compatibility
- Dark mode support
- Compose integration guide

### Phase 3: Flagship Integration (Q3 2026)

**Tasks:**
1. Add Gradle dependency to flagship app
2. Replace manual color copying with AAR dependency
3. Update color references to use Compose color schemes
4. Test build and runtime behavior
5. Remove legacy cedar-release.aar dependency

**Deliverables:**
- Flagship app consuming AAR library
- Removed manual copy-paste process
- Migration documentation

### Phase 4: Wide-Gamut OKLCH Implementation (Q4 2026)

**Tasks:**
1. Implement wide-gamut OKLCH color generation for Android
2. Align with Cedar color architecture work
3. Document device capability matrix for wide-gamut support
4. Demonstrate OKLCH vs sRGB visual differences
5. Position Cedar as leader in modern Android color support

**Deliverables:**
- Wide-gamut OKLCH color support
- Visual demonstration of OKLCH benefits
- Device capability documentation
- Leadership positioning materials

### Phase 5: Education & Adoption (Q1 2027)

**Tasks:**
1. Share wide-gamut findings with Android community
2. Document Cedar's Android leadership approach
3. Encourage other teams to adopt Compose-first
4. Provide migration guidance from XML to Compose

**Deliverables:**
- Leadership case studies
- Community education materials
- Migration guides
- Best practices documentation

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

### From Manual Copying to OKLCH Wide-Gamut

**Step 1: Education (Q4 2026)**
- Demonstrate OKLCH vs sRGB visual differences
- Document device capability matrix
- Educate Android team on OKLCH benefits
- Align with Cedar color architecture work

**Step 2: OKLCH Implementation (Q1 2027)**
- Implement wide-gamut OKLCH color generation
- Position as Cedar leadership initiative
- Document benefits and use cases
- Share findings with Android community

**Step 3: Leadership Positioning (Q2 2027)**
- Demonstrate Cedar as forward-looking Android design system
- Publish case studies on OKLCH benefits
- Encourage industry adoption of modern Android color practices

## Non-Goals

This ADR does not address:

- **Runtime palette switching:** Build-time appearance selection is sufficient for current use cases
- **Token generation logic:** That's covered by ADR-0005 (Transform Layer)
- **Canonical token model:** That's covered by ADR-0001 (Canonical Token Model)
- **Figma integration:** Figma sync-back is out of scope for Android distribution

## Consequences

- Enables automated token updates via standard Gradle dependency management and reduces manual copy/paste
- Requires ongoing maintenance of the AAR packaging/publishing pipeline and versioning coordination with consumers
- Positions Cedar as a leader in Android wide-gamut color support with OKLCH
- Provides both Compose-first modern approach and XML legacy compatibility for gradual migration
- Establishes automated distribution architecture that applies to all foundation categories (color, typography, spacing, etc.)

## Related Documents

- ADR-0005: Transform Layer & Platform Outputs
- ADR-0013: Consumer Models
- Cedar Native Color Support Discovery v3
- Mobile Team Discovery Findings
- Flagship Android Project Analysis
