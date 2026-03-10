import { NextRequest, NextResponse } from "next/server"

// GitHub API endpoint for fetching file contents
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const owner = searchParams.get("owner")
  const repo = searchParams.get("repo")
  const path = searchParams.get("path")
  const token = searchParams.get("token") // User-provided token for private repos
  const ref = searchParams.get("ref") || "main" // Branch or commit, default to main

  if (!owner || !repo || !path) {
    return NextResponse.json(
      { error: "Missing required parameters: owner, repo, path" },
      { status: 400 }
    )
  }

  try {
    const githubUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
    
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "SFM-Workflow-Builder",
    }

    // Use provided token or fall back to server environment variable
    const authToken = token || process.env.GITHUB_TOKEN
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(githubUrl, { headers })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "File not found. Check the repository, path, and branch." },
          { status: 404 }
        )
      }
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "Authentication required. Please provide a valid GitHub token for private repositories." },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: `GitHub API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const content = await response.text()
    
    // Try to parse as JSON to validate workflow structure
    try {
      const jsonContent = JSON.parse(content)
      
      // Validate workflow structure
      if (!jsonContent.nodes || !Array.isArray(jsonContent.nodes)) {
        return NextResponse.json(
          { error: "Invalid workflow format: missing 'nodes' array" },
          { status: 400 }
        )
      }
      if (!jsonContent.edges || !Array.isArray(jsonContent.edges)) {
        return NextResponse.json(
          { error: "Invalid workflow format: missing 'edges' array" },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        data: jsonContent,
        meta: {
          owner,
          repo,
          path,
          ref,
          nodesCount: jsonContent.nodes.length,
          edgesCount: jsonContent.edges.length,
          hasEvidence: Array.isArray(jsonContent.evidence),
          evidenceCount: jsonContent.evidence?.length || 0,
        },
      })
    } catch {
      return NextResponse.json(
        { error: "File is not valid JSON" },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("GitHub fetch error:", error)
    return NextResponse.json(
      { error: `Failed to fetch from GitHub: ${error.message}` },
      { status: 500 }
    )
  }
}

// List files in a directory (for browsing templates)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { owner, repo, path = "", token, ref = "main" } = body

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing required parameters: owner, repo" },
        { status: 400 }
      )
    }

    const githubUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
    
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "SFM-Workflow-Builder",
    }

    const authToken = token || process.env.GITHUB_TOKEN
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(githubUrl, { headers })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Repository or path not found" },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: `GitHub API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const contents = await response.json()
    
    // Filter to only show JSON files and directories
    const items = Array.isArray(contents) 
      ? contents
          .filter((item: any) => item.type === "dir" || item.name.endsWith(".json"))
          .map((item: any) => ({
            name: item.name,
            path: item.path,
            type: item.type,
            size: item.size,
            downloadUrl: item.download_url,
          }))
      : []

    return NextResponse.json({
      success: true,
      items,
      meta: { owner, repo, path, ref },
    })
  } catch (error: any) {
    console.error("GitHub list error:", error)
    return NextResponse.json(
      { error: `Failed to list files: ${error.message}` },
      { status: 500 }
    )
  }
}
