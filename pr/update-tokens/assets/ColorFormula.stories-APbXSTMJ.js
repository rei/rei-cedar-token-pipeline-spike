import{t as e}from"./chunk-BvrOYcoh.js";import{a as t,n,r,t as i}from"./oklch-formulas-Du5qaBes.js";var a,o,s;e((()=>{t(),a={title:`Tokens/Color/Formula`,tags:[`docs`]},o={name:`Overview`,render:()=>`
      <div style="max-width:900px;padding:40px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#333">
        <h1 style="font-size:2.5rem;margin-bottom:1rem">Color Formula</h1>
        <p style="font-size:1.1rem;color:#666;margin-bottom:2rem">
          The Cedar color system uses a mathematical formula to generate color palettes. This ensures consistent, predictable color relationships across all color families.
        </p>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">The Parabolic Chroma Formula</h2>
        <div style="background:#f5f2eb;padding:1.5rem;border-radius:8px;margin:1.5rem 0;font-family:'DM Mono',monospace;font-size:0.95rem">
          C(L) = Cmin + (Cmax - Cmin) × (1 - ((L - Lo) / W)²)
        </div>

        <h3 style="font-size:1.3rem;margin:1.5rem 0 0.5rem">Parameters</h3>
        <table style="width:100%;border-collapse:collapse;margin:1rem 0">
          <tr style="border-bottom:2px solid #ddd">
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Parameter</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Description</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Range</th>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>L</strong></td>
            <td style="padding:0.75rem">Lightness (0–1)</td>
            <td style="padding:0.75rem">${r}–${n}</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>C(L)</strong></td>
            <td style="padding:0.75rem">Chroma at lightness L</td>
            <td style="padding:0.75rem">Cmin–Cmax</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>Cmax</strong></td>
            <td style="padding:0.75rem">Peak chroma (brightest color)</td>
            <td style="padding:0.75rem">0–0.2</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>Lo</strong></td>
            <td style="padding:0.75rem">Lightness level at peak chroma</td>
            <td style="padding:0.75rem">${r}–${n}</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>W</strong></td>
            <td style="padding:0.75rem">Width of curve (Wlight for L≥Lo, Wdark for L≤Lo)</td>
            <td style="padding:0.75rem">0–1</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>Cmin</strong></td>
            <td style="padding:0.75rem">Chroma floor (Clight-min or Cdark-min)</td>
            <td style="padding:0.75rem">0–0.1</td>
          </tr>
          <tr>
            <td style="padding:0.75rem"><strong>Hue</strong></td>
            <td style="padding:0.75rem">Hue angle (0–360°)</td>
            <td style="padding:0.75rem">0–360</td>
          </tr>
        </table>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Current Formula Parameters</h2>
        <p style="margin-bottom:1rem">
          Each color family has its own set of parameters. These are defined in the codebase and are the source of truth for color generation.
        </p>

        <table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.9rem">
          <tr style="border-bottom:2px solid #ddd">
            <th style="text-align:left;padding:0.5rem;background:#fafafa">Family</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Hue</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Cmax</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Lo</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Wlight</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Clight-min</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Wdark</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Cdark-min</th>
          </tr>
          ${Object.entries(i).map(([e,t])=>`
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:0.5rem;font-weight:500">${e}</td>
              <td style="text-align:center;padding:0.5rem">${t.hue}°</td>
              <td style="text-align:center;padding:0.5rem">${t.cmax}</td>
              <td style="text-align:center;padding:0.5rem">${t.lo}</td>
              <td style="text-align:center;padding:0.5rem">${t.wlight}</td>
              <td style="text-align:center;padding:0.5rem">${t.clightMin}</td>
              <td style="text-align:center;padding:0.5rem">${t.wdark}</td>
              <td style="text-align:center;padding:0.5rem">${t.cdarkMin}</td>
            </tr>
          `).join(``)}
        </table>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">How to Change the Formula</h2>
        <p style="margin-bottom:1rem">
          If you want to adjust the color formula (e.g., change the hue, make colors more saturated, adjust the curve), follow this workflow:
        </p>

        <div style="background:#e8f4fd;border-left:4px solid #007bff;padding:1.5rem;margin:1.5rem 0;border-radius:0 8px 8px 0">
          <h3 style="font-size:1.2rem;margin:0 0 1rem;color:#0056b3">Workflow for Formula Changes</h3>
          <ol style="margin:0;padding-left:1.5rem">
            <li style="margin-bottom:0.75rem">
              <strong>Open a ticket</strong> with the engineering team describing the desired change (e.g., "Make success-green more saturated by increasing Cmax to 0.15")
            </li>
            <li style="margin-bottom:0.75rem">
              <strong>Engineer updates the formula</strong> in <code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">style-dictionary/actions/web/oklch-formulas.ts</code>
            </li>
            <li style="margin-bottom:0.75rem">
              <strong>Test fails</strong> — The validation test will fail because Figma hex values no longer match the new formula output
            </li>
            <li style="margin-bottom:0.75rem">
              <strong>Designer updates Figma</strong> — Using the new formula output, update the Figma color variables to match
            </li>
            <li style="margin-bottom:0.75rem">
              <strong>Re-sync</strong> — Run the Figma sync command to pull the updated values
            </li>
            <li>
              <strong>Test passes</strong> — The validation test confirms Figma values align with the new formula
            </li>
          </ol>
        </div>

        <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:1.5rem;margin:1.5rem 0;border-radius:0 8px 8px 0">
          <h3 style="font-size:1.2rem;margin:0 0 1rem;color:#856404">Important Notes</h3>
          <ul style="margin:0;padding-left:1.5rem">
            <li style="margin-bottom:0.5rem">
              <strong>The repo is the source of truth</strong> — Formula parameters live in the codebase, not in Figma
            </li>
            <li style="margin-bottom:0.5rem">
              <strong>Always update the formula first</strong> — Don't change Figma hex values without updating the formula, or the validation test will fail
            </li>
            <li style="margin-bottom:0.5rem">
              <strong>Validation test enforces alignment</strong> — The test in <code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">src/contract/figma-color-spec.test.ts</code> ensures Figma values always match the formula
            </li>
          </ul>
        </div>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Current Discrepancies</h2>
        <p style="margin-bottom:1rem">
          See the <a href="/?path=/docs/docs-figma-discrepancies--docs" style="color:#007bff;text-decoration:underline">Figma Color Discrepancies</a> document for current issues where Figma values don't match the formula output.
        </p>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Technical Details</h2>
        <p style="margin-bottom:1rem">
          The formula is implemented in <code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">style-dictionary/actions/web/oklch-formulas.ts</code> and produces OKLCH color values. OKLCH is the source of truth for the color system.
        </p>
        <p style="margin-bottom:1rem">
          <strong>Color Conversion Pipeline:</strong>
        </p>
        <ul style="margin:0 0 1rem;padding-left:1.5rem">
          <li style="margin-bottom:0.5rem">Formula produces OKLCH values (source of truth)</li>
          <li style="margin-bottom:0.5rem">Web: Uses OKLCH directly with custom formulas</li>
          <li style="margin-bottom:0.5rem">iOS: culori converts OKLCH → Display P3 for XCAssets</li>
          <li style="margin-bottom:0.5rem">Android: culori converts OKLCH → Display P3 for Compose (XML uses sRGB fallback)</li>
          <li>Hex values are lossy sRGB clips of OKLCH, provided for reference only</li>
        </ul>
        <p style="margin-bottom:1rem">
          The validation test is in <code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">src/contract/figma-color-spec.test.ts</code> and runs on every contract test suite execution.
        </p>
      </div>
    `},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Overview",
  render: () => {
    return \`
      <div style="max-width:900px;padding:40px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#333">
        <h1 style="font-size:2.5rem;margin-bottom:1rem">Color Formula</h1>
        <p style="font-size:1.1rem;color:#666;margin-bottom:2rem">
          The Cedar color system uses a mathematical formula to generate color palettes. This ensures consistent, predictable color relationships across all color families.
        </p>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">The Parabolic Chroma Formula</h2>
        <div style="background:#f5f2eb;padding:1.5rem;border-radius:8px;margin:1.5rem 0;font-family:'DM Mono',monospace;font-size:0.95rem">
          C(L) = Cmin + (Cmax - Cmin) × (1 - ((L - Lo) / W)²)
        </div>

        <h3 style="font-size:1.3rem;margin:1.5rem 0 0.5rem">Parameters</h3>
        <table style="width:100%;border-collapse:collapse;margin:1rem 0">
          <tr style="border-bottom:2px solid #ddd">
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Parameter</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Description</th>
            <th style="text-align:left;padding:0.75rem;background:#fafafa">Range</th>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>L</strong></td>
            <td style="padding:0.75rem">Lightness (0–1)</td>
            <td style="padding:0.75rem">\${LMIN}–\${LMAX}</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>C(L)</strong></td>
            <td style="padding:0.75rem">Chroma at lightness L</td>
            <td style="padding:0.75rem">Cmin–Cmax</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>Cmax</strong></td>
            <td style="padding:0.75rem">Peak chroma (brightest color)</td>
            <td style="padding:0.75rem">0–0.2</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>Lo</strong></td>
            <td style="padding:0.75rem">Lightness level at peak chroma</td>
            <td style="padding:0.75rem">\${LMIN}–\${LMAX}</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>W</strong></td>
            <td style="padding:0.75rem">Width of curve (Wlight for L≥Lo, Wdark for L≤Lo)</td>
            <td style="padding:0.75rem">0–1</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:0.75rem"><strong>Cmin</strong></td>
            <td style="padding:0.75rem">Chroma floor (Clight-min or Cdark-min)</td>
            <td style="padding:0.75rem">0–0.1</td>
          </tr>
          <tr>
            <td style="padding:0.75rem"><strong>Hue</strong></td>
            <td style="padding:0.75rem">Hue angle (0–360°)</td>
            <td style="padding:0.75rem">0–360</td>
          </tr>
        </table>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Current Formula Parameters</h2>
        <p style="margin-bottom:1rem">
          Each color family has its own set of parameters. These are defined in the codebase and are the source of truth for color generation.
        </p>

        <table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.9rem">
          <tr style="border-bottom:2px solid #ddd">
            <th style="text-align:left;padding:0.5rem;background:#fafafa">Family</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Hue</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Cmax</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Lo</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Wlight</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Clight-min</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Wdark</th>
            <th style="text-align:center;padding:0.5rem;background:#fafafa">Cdark-min</th>
          </tr>
          \${Object.entries(COLOR_FAMILIES).map(([name, f]) => \`
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:0.5rem;font-weight:500">\${name}</td>
              <td style="text-align:center;padding:0.5rem">\${f.hue}°</td>
              <td style="text-align:center;padding:0.5rem">\${f.cmax}</td>
              <td style="text-align:center;padding:0.5rem">\${f.lo}</td>
              <td style="text-align:center;padding:0.5rem">\${f.wlight}</td>
              <td style="text-align:center;padding:0.5rem">\${f.clightMin}</td>
              <td style="text-align:center;padding:0.5rem">\${f.wdark}</td>
              <td style="text-align:center;padding:0.5rem">\${f.cdarkMin}</td>
            </tr>
          \`).join('')}
        </table>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">How to Change the Formula</h2>
        <p style="margin-bottom:1rem">
          If you want to adjust the color formula (e.g., change the hue, make colors more saturated, adjust the curve), follow this workflow:
        </p>

        <div style="background:#e8f4fd;border-left:4px solid #007bff;padding:1.5rem;margin:1.5rem 0;border-radius:0 8px 8px 0">
          <h3 style="font-size:1.2rem;margin:0 0 1rem;color:#0056b3">Workflow for Formula Changes</h3>
          <ol style="margin:0;padding-left:1.5rem">
            <li style="margin-bottom:0.75rem">
              <strong>Open a ticket</strong> with the engineering team describing the desired change (e.g., "Make success-green more saturated by increasing Cmax to 0.15")
            </li>
            <li style="margin-bottom:0.75rem">
              <strong>Engineer updates the formula</strong> in <code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">style-dictionary/actions/web/oklch-formulas.ts</code>
            </li>
            <li style="margin-bottom:0.75rem">
              <strong>Test fails</strong> — The validation test will fail because Figma hex values no longer match the new formula output
            </li>
            <li style="margin-bottom:0.75rem">
              <strong>Designer updates Figma</strong> — Using the new formula output, update the Figma color variables to match
            </li>
            <li style="margin-bottom:0.75rem">
              <strong>Re-sync</strong> — Run the Figma sync command to pull the updated values
            </li>
            <li>
              <strong>Test passes</strong> — The validation test confirms Figma values align with the new formula
            </li>
          </ol>
        </div>

        <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:1.5rem;margin:1.5rem 0;border-radius:0 8px 8px 0">
          <h3 style="font-size:1.2rem;margin:0 0 1rem;color:#856404">Important Notes</h3>
          <ul style="margin:0;padding-left:1.5rem">
            <li style="margin-bottom:0.5rem">
              <strong>The repo is the source of truth</strong> — Formula parameters live in the codebase, not in Figma
            </li>
            <li style="margin-bottom:0.5rem">
              <strong>Always update the formula first</strong> — Don't change Figma hex values without updating the formula, or the validation test will fail
            </li>
            <li style="margin-bottom:0.5rem">
              <strong>Validation test enforces alignment</strong> — The test in <code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">src/contract/figma-color-spec.test.ts</code> ensures Figma values always match the formula
            </li>
          </ul>
        </div>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Current Discrepancies</h2>
        <p style="margin-bottom:1rem">
          See the <a href="/?path=/docs/docs-figma-discrepancies--docs" style="color:#007bff;text-decoration:underline">Figma Color Discrepancies</a> document for current issues where Figma values don't match the formula output.
        </p>

        <h2 style="font-size:1.8rem;margin:2rem 0 1rem">Technical Details</h2>
        <p style="margin-bottom:1rem">
          The formula is implemented in <code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">style-dictionary/actions/web/oklch-formulas.ts</code> and produces OKLCH color values. OKLCH is the source of truth for the color system.
        </p>
        <p style="margin-bottom:1rem">
          <strong>Color Conversion Pipeline:</strong>
        </p>
        <ul style="margin:0 0 1rem;padding-left:1.5rem">
          <li style="margin-bottom:0.5rem">Formula produces OKLCH values (source of truth)</li>
          <li style="margin-bottom:0.5rem">Web: Uses OKLCH directly with custom formulas</li>
          <li style="margin-bottom:0.5rem">iOS: culori converts OKLCH → Display P3 for XCAssets</li>
          <li style="margin-bottom:0.5rem">Android: culori converts OKLCH → Display P3 for Compose (XML uses sRGB fallback)</li>
          <li>Hex values are lossy sRGB clips of OKLCH, provided for reference only</li>
        </ul>
        <p style="margin-bottom:1rem">
          The validation test is in <code style="background:#f0f0f0;padding:0.2rem 0.4rem;border-radius:4px">src/contract/figma-color-spec.test.ts</code> and runs on every contract test suite execution.
        </p>
      </div>
    \`;
  }
}`,...o.parameters?.docs?.source}}},s=[`Overview`]}))();export{o as Overview,s as __namedExportsOrder,a as default};