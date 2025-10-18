#!/usr/bin/env node

/**
 * Design System MCP Server
 *
 * Exposes design system components and themes to AI assistants via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'list_components',
    description: 'List all available design system components with optional category filter',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter by category (e.g., buttons, inputs, layout)',
        },
      },
    },
  },
  {
    name: 'get_component',
    description: 'Get detailed information about a specific component including code, props, variants, and examples',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'The component slug (e.g., "button", "input")',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'search_components',
    description: 'Search components by name, description, or category',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        category: {
          type: 'string',
          description: 'Optional category filter',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_themes',
    description: 'List all available themes with their color palettes',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_theme',
    description: 'Get detailed information about a specific theme including all color tokens',
    inputSchema: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          description: 'The theme value (e.g., "light", "dark")',
        },
      },
      required: ['value'],
    },
  },
]

// Create server instance
const server = new Server(
  {
    name: 'design-system',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}))

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'list_components': {
        let query = supabase.from('components').select('*').order('name', { ascending: true })

        if (args?.category) {
          query = query.eq('category', args.category)
        }

        const { data, error } = await query

        if (error) throw error

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  components: data || [],
                  count: data?.length || 0,
                },
                null,
                2
              ),
            },
          ],
        }
      }

      case 'get_component': {
        const { slug } = args as { slug: string }

        const { data, error } = await supabase
          .from('components')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error || !data) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Component not found' }),
              },
            ],
            isError: true,
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        }
      }

      case 'search_components': {
        const { query: searchQuery, category } = args as { query: string; category?: string }

        let dbQuery = supabase
          .from('components')
          .select('*')
          .or(
            `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`
          )
          .limit(50)

        if (category) {
          dbQuery = dbQuery.eq('category', category)
        }

        const { data, error } = await dbQuery

        if (error) throw error

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  results: data || [],
                  count: data?.length || 0,
                  query: searchQuery,
                },
                null,
                2
              ),
            },
          ],
        }
      }

      case 'list_themes': {
        const { data, error } = await supabase.from('themes').select('*').order('name', { ascending: true })

        if (error) throw error

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  themes: data || [],
                  count: data?.length || 0,
                },
                null,
                2
              ),
            },
          ],
        }
      }

      case 'get_theme': {
        const { value } = args as { value: string }

        const { data, error } = await supabase.from('themes').select('*').eq('value', value).single()

        if (error || !data) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Theme not found' }),
              },
            ],
            isError: true,
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
          isError: true,
        }
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }),
        },
      ],
      isError: true,
    }
  }
})

// Start server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Design System MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
