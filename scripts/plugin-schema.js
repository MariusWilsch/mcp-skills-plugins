/**
 * Official Claude Code Plugin Schema Definition
 *
 * Based on: https://docs.claude.com/en/plugins-reference
 *
 * This module defines the official plugin.json schema and provides
 * validation functions to ensure plugins conform to the specification.
 */

const VALID_PLUGIN_FIELDS = [
  'name',           // required - unique identifier (kebab-case)
  'version',        // optional - semantic version
  'description',    // optional - brief plugin description
  'author',         // optional - author information (object)
  'homepage',       // optional - documentation URL
  'repository',     // optional - source code URL
  'license',        // optional - license identifier
  'keywords',       // optional - discovery tags (array)
  'commands',       // optional - additional command paths (string|array)
  'agents',         // optional - additional agent paths (string|array)
  'hooks',          // optional - hook config path or inline (string|object)
  'mcpServers'      // optional - MCP server config path or inline (string|object)
];

const REQUIRED_FIELDS = ['name'];

/**
 * Validates a plugin.json object against the official schema
 * @param {object} pluginJson - The parsed plugin.json content
 * @param {string} pluginName - The plugin name for error messages
 * @returns {object} { errors: string[], warnings: string[] }
 */
function validatePluginSchema(pluginJson, pluginName = 'unknown') {
  const errors = [];
  const warnings = [];

  // 1. Check for required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!pluginJson[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // 2. Check for invalid/unrecognized fields
  Object.keys(pluginJson).forEach(field => {
    if (!VALID_PLUGIN_FIELDS.includes(field)) {
      errors.push(`Invalid field '${field}' - not part of official Claude Code plugin schema`);

      // Provide helpful suggestions for common mistakes
      if (field === 'mcp') {
        errors.push(`  → Did you mean 'mcpServers'? Note: 'mcpServers' is only for plugins that bundle their own MCP server executables`);
      } else if (field === 'mcpServer') {
        errors.push(`  → Field should be 'mcpServers' (plural), not 'mcpServer'`);
      }
    }
  });

  // 3. Validate field types
  if (pluginJson.name !== undefined) {
    if (typeof pluginJson.name !== 'string') {
      errors.push('Field "name" must be a string');
    } else if (!/^[a-z0-9-]+$/.test(pluginJson.name)) {
      warnings.push('Field "name" should use kebab-case (lowercase with hyphens)');
    }
  }

  if (pluginJson.version !== undefined) {
    if (typeof pluginJson.version !== 'string') {
      errors.push('Field "version" must be a string');
    } else if (!/^\d+\.\d+\.\d+/.test(pluginJson.version)) {
      warnings.push('Field "version" should follow semantic versioning (e.g., "1.0.0")');
    }
  }

  if (pluginJson.description !== undefined) {
    if (typeof pluginJson.description !== 'string') {
      errors.push('Field "description" must be a string');
    }
  }

  if (pluginJson.author !== undefined) {
    if (typeof pluginJson.author !== 'object' || Array.isArray(pluginJson.author)) {
      errors.push('Field "author" must be an object');
    } else {
      if (pluginJson.author.name && typeof pluginJson.author.name !== 'string') {
        errors.push('Field "author.name" must be a string');
      }
      if (pluginJson.author.email && typeof pluginJson.author.email !== 'string') {
        errors.push('Field "author.email" must be a string');
      }
      if (pluginJson.author.url && typeof pluginJson.author.url !== 'string') {
        errors.push('Field "author.url" must be a string');
      }
    }
  }

  if (pluginJson.homepage !== undefined && typeof pluginJson.homepage !== 'string') {
    errors.push('Field "homepage" must be a string');
  }

  if (pluginJson.repository !== undefined && typeof pluginJson.repository !== 'string') {
    errors.push('Field "repository" must be a string');
  }

  if (pluginJson.license !== undefined && typeof pluginJson.license !== 'string') {
    errors.push('Field "license" must be a string');
  }

  if (pluginJson.keywords !== undefined) {
    if (!Array.isArray(pluginJson.keywords)) {
      errors.push('Field "keywords" must be an array');
    } else {
      pluginJson.keywords.forEach((keyword, index) => {
        if (typeof keyword !== 'string') {
          errors.push(`Field "keywords[${index}]" must be a string`);
        }
      });
    }
  }

  // 4. Validate component path fields
  ['commands', 'agents'].forEach(field => {
    if (pluginJson[field] !== undefined) {
      const isString = typeof pluginJson[field] === 'string';
      const isArray = Array.isArray(pluginJson[field]);

      if (!isString && !isArray) {
        errors.push(`Field "${field}" must be a string or array`);
      } else if (isArray) {
        pluginJson[field].forEach((path, index) => {
          if (typeof path !== 'string') {
            errors.push(`Field "${field}[${index}]" must be a string`);
          } else if (!path.startsWith('./')) {
            errors.push(`Field "${field}[${index}]" must be a relative path starting with './'`);
          }
        });
      } else if (isString && !pluginJson[field].startsWith('./')) {
        errors.push(`Field "${field}" must be a relative path starting with './'`);
      }
    }
  });

  // 5. Validate hooks field
  if (pluginJson.hooks !== undefined) {
    const isString = typeof pluginJson.hooks === 'string';
    const isObject = typeof pluginJson.hooks === 'object' && !Array.isArray(pluginJson.hooks);

    if (!isString && !isObject) {
      errors.push('Field "hooks" must be a string (path) or object (inline config)');
    } else if (isString && !pluginJson.hooks.startsWith('./')) {
      errors.push('Field "hooks" path must start with \'./\'');
    }
  }

  // 6. Validate mcpServers field
  if (pluginJson.mcpServers !== undefined) {
    const isString = typeof pluginJson.mcpServers === 'string';
    const isObject = typeof pluginJson.mcpServers === 'object' && !Array.isArray(pluginJson.mcpServers);

    if (!isString && !isObject) {
      errors.push('Field "mcpServers" must be a string (path) or object (inline config)');
    } else if (isString && !pluginJson.mcpServers.startsWith('./')) {
      errors.push('Field "mcpServers" path must start with \'./\'');
    }
  }

  return { errors, warnings };
}

/**
 * Quick validation check - returns true if valid, false otherwise
 * @param {object} pluginJson - The parsed plugin.json content
 * @returns {boolean}
 */
function isValidPlugin(pluginJson) {
  const { errors } = validatePluginSchema(pluginJson);
  return errors.length === 0;
}

module.exports = {
  VALID_PLUGIN_FIELDS,
  REQUIRED_FIELDS,
  validatePluginSchema,
  isValidPlugin
};
