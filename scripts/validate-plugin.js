#!/usr/bin/env node

/**
 * Comprehensive Single Plugin Validator
 *
 * Validates a Claude Code plugin directory against the official schema
 * and structural requirements.
 *
 * Usage: node scripts/validate-plugin.js <plugin-directory>
 */

const fs = require('fs');
const path = require('path');
const { validatePluginSchema } = require('./plugin-schema');

function validatePlugin(pluginPath) {
  console.log(`\n🔍 Validating plugin at: ${pluginPath}\n`);

  const errors = [];
  const warnings = [];

  // 1. Check plugin directory exists
  if (!fs.existsSync(pluginPath)) {
    console.error(`\n❌ Plugin directory not found: ${pluginPath}\n`);
    process.exit(1);
  }

  // 2. Check .claude-plugin/plugin.json exists
  const pluginJsonPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(pluginJsonPath)) {
    errors.push('.claude-plugin/plugin.json not found');
    errors.push('  → The plugin manifest must be at .claude-plugin/plugin.json');
    reportResults(errors, warnings, pluginPath);
    return;
  }

  console.log('✓ Found plugin.json');

  // 3. Parse plugin.json
  let pluginJson;
  try {
    const content = fs.readFileSync(pluginJsonPath, 'utf-8');
    pluginJson = JSON.parse(content);
    console.log('✓ plugin.json is valid JSON');
  } catch (err) {
    errors.push(`Invalid JSON in plugin.json: ${err.message}`);
    reportResults(errors, warnings, pluginPath);
    return;
  }

  // 4. Validate against official Claude Code plugin schema
  console.log('\nValidating against official plugin schema...');
  const schemaValidation = validatePluginSchema(pluginJson, pluginJson.name || 'unknown');

  if (schemaValidation.errors.length > 0) {
    console.log('✗ Schema validation failed');
    errors.push(...schemaValidation.errors);
  } else {
    console.log('✓ Schema validation passed');
  }

  if (schemaValidation.warnings.length > 0) {
    warnings.push(...schemaValidation.warnings);
  }

  // 5. Check plugin structure
  console.log('\nChecking plugin structure...');

  const hasAgents = fs.existsSync(path.join(pluginPath, 'agents'));
  const hasSkills = fs.existsSync(path.join(pluginPath, 'skills'));
  const hasCommands = fs.existsSync(path.join(pluginPath, 'commands'));
  const hasReadme = fs.existsSync(path.join(pluginPath, 'README.md'));

  if (!hasAgents && !hasSkills && !hasCommands) {
    warnings.push('No agents/, skills/, or commands/ directories found');
    warnings.push('  → Plugin should provide at least one of: agents, skills, or commands');
  }

  if (!hasReadme) {
    warnings.push('README.md not found - recommended for user documentation');
  }

  // 6. Validate agents (if present)
  if (hasAgents) {
    const agentsPath = path.join(pluginPath, 'agents');
    const agentFiles = fs.readdirSync(agentsPath)
      .filter(f => f.endsWith('.md'));

    if (agentFiles.length === 0) {
      warnings.push('agents/ directory exists but contains no .md files');
    } else {
      console.log(`✓ Found ${agentFiles.length} agent(s): ${agentFiles.join(', ')}`);

      // Check agent files have frontmatter
      agentFiles.forEach(agentFile => {
        const agentPath = path.join(agentsPath, agentFile);
        const content = fs.readFileSync(agentPath, 'utf-8');

        if (!content.startsWith('---')) {
          warnings.push(`Agent ${agentFile} missing YAML frontmatter`);
        }
      });
    }
  }

  // 7. Validate skills (if present)
  if (hasSkills) {
    const skillsPath = path.join(pluginPath, 'skills');
    const skillDirs = fs.readdirSync(skillsPath)
      .filter(f => {
        const fullPath = path.join(skillsPath, f);
        return fs.statSync(fullPath).isDirectory();
      });

    if (skillDirs.length === 0) {
      warnings.push('skills/ directory exists but contains no skill directories');
    } else {
      console.log(`✓ Found ${skillDirs.length} skill(s): ${skillDirs.join(', ')}`);

      skillDirs.forEach(skillDir => {
        const skillMdPath = path.join(skillsPath, skillDir, 'SKILL.md');
        if (!fs.existsSync(skillMdPath)) {
          errors.push(`Skill '${skillDir}' missing required SKILL.md file`);
        } else {
          // Check SKILL.md has frontmatter
          const content = fs.readFileSync(skillMdPath, 'utf-8');
          if (!content.startsWith('---')) {
            warnings.push(`Skill '${skillDir}' SKILL.md missing YAML frontmatter`);
          }
        }
      });
    }
  }

  // 8. Validate commands (if present)
  if (hasCommands) {
    const commandsPath = path.join(pluginPath, 'commands');
    const commandFiles = fs.readdirSync(commandsPath)
      .filter(f => f.endsWith('.md'));

    if (commandFiles.length === 0) {
      warnings.push('commands/ directory exists but contains no .md files');
    } else {
      console.log(`✓ Found ${commandFiles.length} command(s): ${commandFiles.join(', ')}`);

      // Check command files have frontmatter
      commandFiles.forEach(commandFile => {
        const commandPath = path.join(commandsPath, commandFile);
        const content = fs.readFileSync(commandPath, 'utf-8');

        if (!content.startsWith('---')) {
          warnings.push(`Command ${commandFile} missing YAML frontmatter`);
        }
      });
    }
  }

  // 9. Check for hooks configuration
  if (pluginJson.hooks) {
    if (typeof pluginJson.hooks === 'string') {
      const hooksPath = path.join(pluginPath, pluginJson.hooks.replace('./', ''));
      if (!fs.existsSync(hooksPath)) {
        errors.push(`hooks configuration file not found: ${pluginJson.hooks}`);
      } else {
        console.log(`✓ Found hooks configuration: ${pluginJson.hooks}`);
      }
    } else {
      console.log('✓ Hooks configured inline in plugin.json');
    }
  }

  // 10. Check for MCP servers configuration
  if (pluginJson.mcpServers) {
    if (typeof pluginJson.mcpServers === 'string') {
      const mcpPath = path.join(pluginPath, pluginJson.mcpServers.replace('./', ''));
      if (!fs.existsSync(mcpPath)) {
        errors.push(`mcpServers configuration file not found: ${pluginJson.mcpServers}`);
      } else {
        console.log(`✓ Found MCP servers configuration: ${pluginJson.mcpServers}`);
      }
    } else {
      console.log('✓ MCP servers configured inline in plugin.json');
    }
  }

  // 11. Report results
  reportResults(errors, warnings, pluginPath);
}

function reportResults(errors, warnings, pluginPath) {
  console.log('\n' + '='.repeat(70));

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:\n');
    errors.forEach(err => console.error(`  • ${err}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:\n');
    warnings.forEach(warn => console.warn(`  • ${warn}`));
  }

  console.log('\n' + '='.repeat(70));

  if (errors.length > 0) {
    console.error(`\n❌ Validation FAILED for ${path.basename(pluginPath)}`);
    console.error(`\nPlugin at ${pluginPath} has validation errors.`);
    console.error('Please fix the errors before installing or publishing the plugin.\n');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log(`\n⚠️  Validation PASSED with warnings for ${path.basename(pluginPath)}`);
    console.log('\nConsider addressing the warnings to improve plugin quality.\n');
    process.exit(0);
  } else {
    console.log(`\n✅ Validation PASSED for ${path.basename(pluginPath)}`);
    console.log('\nPlugin is ready for installation or publishing.\n');
    process.exit(0);
  }
}

// CLI usage
if (require.main === module) {
  const pluginPath = process.argv[2];

  if (!pluginPath) {
    console.error('\n❌ Usage: node scripts/validate-plugin.js <plugin-directory>\n');
    console.error('Example: node scripts/validate-plugin.js chrome-devtools-plugin\n');
    process.exit(1);
  }

  validatePlugin(pluginPath);
}

module.exports = { validatePlugin };
