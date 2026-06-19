import type { StoryObj, Meta } from "@storybook/html";

type MultiPlatformDistributionArgs = Record<string, never>;

const meta: Meta<MultiPlatformDistributionArgs> = {
  title: "Tokens/Multi-Platform Distribution",
  tags: ["docs"],
};

export default meta;

type Story = StoryObj<MultiPlatformDistributionArgs>;

export const Overview: Story = {
  name: "Overview",
  render: () => {
    return `
      <div style="max-width:1000px;padding:40px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#333">
        <h1 style="font-size:2.5rem;margin-bottom:1rem">Multi-Platform Distribution</h1>
        <p style="font-size:1.1rem;color:#666;margin-bottom:2rem">
          Cedar design tokens are distributed across multiple platforms with platform-specific implementations tailored to each ecosystem's conventions and requirements.
        </p>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Distribution Support Matrix</h2>
        <p style="margin-bottom:1rem">
          The token pipeline generates platform-specific outputs for iOS, Android, and Web. iOS uses Swift Package Manager with Display P3 color space as the modern standard. Android provides both XML resources for legacy Views and Compose color schemes for modern Jetpack Compose development.
        </p>

        <table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.9rem">
          <tr style="border-bottom:2px solid #ddd">
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Platform</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Distribution</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Color Space</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">API Style</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Target Use</th>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem;font-weight:500"><strong>iOS</strong></td>
            <td style="padding:0.75rem">Swift Package Manager</td>
            <td style="padding:0.75rem">Display P3</td>
            <td style="padding:0.75rem">Swift extensions</td>
            <td style="padding:0.75rem">All iOS projects</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem;font-weight:500"><strong>Android XML</strong></td>
            <td style="padding:0.75rem">GitLab Packages (AAR)</td>
            <td style="padding:0.75rem">sRGB</td>
            <td style="padding:0.75rem">XML resources</td>
            <td style="padding:0.75rem">Views (legacy)</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem;font-weight:500"><strong>Android Compose</strong></td>
            <td style="padding:0.75rem">GitLab Packages (AAR)</td>
            <td style="padding:0.75rem">sRGB</td>
            <td style="padding:0.75rem">Kotlin Compose objects</td>
            <td style="padding:0.75rem">Jetpack Compose (modern)</td>
          </tr>
          <tr>
            <td style="padding:0.75rem;font-weight:500"><strong>Web</strong></td>
            <td style="padding:0.75rem">npm</td>
            <td style="padding:0.75rem">sRGB</td>
            <td style="padding:0.75rem">CSS custom properties</td>
            <td style="padding:0.75rem">All web projects</td>
          </tr>
        </table>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Platform-Specific Details</h2>

        <h3 style="font-size:1.4rem;margin:1.5rem 0 0.75rem">iOS Implementation</h3>
        <p style="margin-bottom:1rem">
          Cedar uses Swift Package Manager for iOS distribution with Display P3 color space for wider gamut support. This is the modern standard recommended by mobile platform leadership.
        </p>

        <div style="background:#f5f2eb;padding:1.5rem;border-radius:8px;margin:1.5rem 0">
          <h4 style="margin:0 0 0.75rem;font-size:1.1rem">iOS SPM</h4>
          <ul style="margin:0;padding-left:1.5rem">
            <li style="margin-bottom:0.5rem">Display P3 color space for wider gamut</li>
            <li style="margin-bottom:0.5rem">Swift extension-based API: <code style="background:#fff;padding:0.2rem 0.4rem;border-radius:4px">Color.cdrTextBase</code></li>
            <li style="margin-bottom:0.5rem">SwiftUI and UIKit support via extensions</li>
            <li style="margin-bottom:0.5rem">Automatic light/dark mode via asset catalog</li>
            <li>Objective-C compatibility for legacy integrations</li>
          </ul>
        </div>

        <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:1.5rem;margin:1.5rem 0;border-radius:0 8px 8px 0">
          <h4 style="margin:0 0 0.75rem;font-size:1.1rem;color:#856404">Note on CocoaPods</h4>
          <p style="margin:0;font-size:0.9rem">
            The flagship iOS application currently uses CocoaPods, but mobile platform leadership indicates CocoaPods is being phased out in favor of Swift Package Manager. Cedar focuses on SPM distribution as the forward-looking standard.
          </p>
        </div>

        <h3 style="font-size:1.4rem;margin:1.5rem 0 0.75rem">Android Dual Framework Support</h3>
        <p style="margin-bottom:1rem">
          Cedar generates both XML resources for traditional Views and Kotlin Compose objects for Jetpack Compose, packaged in a single AAR library distributed via GitLab Packages.
        </p>

        <div style="background:#f5f2eb;padding:1.5rem;border-radius:8px;margin:1.5rem 0">
          <h4 style="margin:0 0 0.75rem;font-size:1.1rem">Android XML (Views)</h4>
          <ul style="margin:0 0 1rem;padding-left:1.5rem">
            <li style="margin-bottom:0.5rem">XML resources in <code style="background:#fff;padding:0.2rem 0.4rem;border-radius:4px">res/values/colors.xml</code></li>
            <li style="margin-bottom:0.5rem">Light/dark mode via <code style="background:#fff;padding:0.2rem 0.4rem;border-radius:4px">values-night</code></li>
            <li>Traditional Android Views support</li>
          </ul>
        </div>

        <div style="background:#f5f2eb;padding:1.5rem;border-radius:8px;margin:1.5rem 0">
          <h4 style="margin:0 0 0.75rem;font-size:1.1rem">Android Compose (Modern)</h4>
          <ul style="margin:0;padding-left:1.5rem">
            <li style="margin-bottom:0.5rem">Kotlin object: <code style="background:#fff;padding:0.2rem 0.4rem;border-radius:4px">CedarColors.cdrTextBase</code></li>
            <li style="margin-bottom:0.5rem">Jetpack Compose Color type</li>
            <li>Modern Android UI development</li>
          </ul>
        </div>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Distribution Mechanisms</h2>
        
        <table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.9rem">
          <tr style="border-bottom:2px solid #ddd">
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Platform</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Package Manager</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Repository</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Automation</th>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem;font-weight:500"><strong>iOS</strong></td>
            <td style="padding:0.75rem">SPM / CocoaPods</td>
            <td style="padding:0.75rem">GitHub</td>
            <td style="padding:0.75rem">GitHub Actions</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem;font-weight:500"><strong>Android</strong></td>
            <td style="padding:0.75rem">Gradle (AAR)</td>
            <td style="padding:0.75rem">GitLab Packages</td>
            <td style="padding:0.75rem">GitLab CI/CD</td>
          </tr>
          <tr>
            <td style="padding:0.75rem;font-weight:500"><strong>Web</strong></td>
            <td style="padding:0.75rem">npm</td>
            <td style="padding:0.75rem">npm registry</td>
            <td style="padding:0.75rem">GitHub Actions</td>
          </tr>
        </table>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Output Locations</h2>
        <p style="margin-bottom:1rem">
          Generated token files are organized by platform in the <code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">dist/themes/rei-dot-com/</code> directory:
        </p>

        <ul style="margin:1rem 0;padding-left:1.5rem">
          <li style="margin-bottom:0.5rem"><code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">ios/</code> — iOS output (Display P3, Swift extensions)</li>
          <li style="margin-bottom:0.5rem"><code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">android/</code> — Android output (XML + Compose)</li>
          <li><code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">css/</code> — Web CSS output</li>
        </ul>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Related Documentation</h2>
        <ul style="margin:1rem 0;padding-left:1.5rem">
          <li style="margin-bottom:0.5rem"><a href="/?path=/docs/architecture-adr-0005-transform-layer-and-platform-outputs--docs" style="color:#007bff;text-decoration:underline">ADR-0005: Transform Layer & Platform Outputs</a></li>
          <li style="margin-bottom:0.5rem"><a href="/?path=/docs/architecture-adr-0013-consumer-models--docs" style="color:#007bff;text-decoration:underline">ADR-0013: Consumer Models</a></li>
          <li style="margin-bottom:0.5rem"><a href="/?path=/docs/architecture-adr-0017-android-distribution-strategy--docs" style="color:#007bff;text-decoration:underline">ADR-0017: Android Distribution Strategy</a></li>
          <li><a href="/?path=/docs/docs-android-token-distribution-requirements--docs" style="color:#007bff;text-decoration:underline">Android Token Distribution Requirements</a></li>
        </ul>

        <div style="background:#e8f4fd;border-left:4px solid #007bff;padding:1.5rem;margin:1.5rem 0;border-radius:0 8px 8px 0">
          <h3 style="font-size:1.2rem;margin:0 0 1rem;color:#0056b3">Status</h3>
          <ul style="margin:0;padding-left:1.5rem">
            <li style="margin-bottom:0.5rem"><strong>iOS:</strong> SPM implementation complete (Display P3, Swift extensions)</li>
            <li style="margin-bottom:0.5rem"><strong>Android:</strong> Basic output generation complete, CI/CD and GitLab Packages setup pending</li>
            <li><strong>Web:</strong> Full distribution via npm</li>
          </ul>
        </div>
      </div>
    `;
  },
};
