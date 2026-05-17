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

// List files in a directory or fetch a specific file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, repo, path = "", token, ref = "main" } = body

    if (!repo) {
      return NextResponse.json(
        { error: "Missing required parameter: repo (format: owner/repo)" },
        { status: 400 }
      )
    }

    // Parse owner/repo format
    const [owner, repoName] = repo.includes("/") ? repo.split("/") : [repo, ""]
    if (!owner || !repoName) {
      return NextResponse.json(
        { error: "Invalid repo format. Use: owner/repo" },
        { status: 400 }
      )
    }
    
    const headers: HeadersInit = {
      "User-Agent": "SFM-Workflow-Builder",
    }

    const authToken = token || process.env.GITHUB_TOKEN
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    // Action: list files in repo
    if (action === "list") {
      headers.Accept = "application/vnd.github.v3+json"
      const githubUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${ref}`
      
      const response = await fetch(githubUrl, { headers })

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { error: "Repository or path not found" },
            { status: 404 }
          )
        }
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json(
            { error: "Authentication required for this repository" },
            { status: 401 }
          )
        }
        return NextResponse.json(
          { error: `GitHub API error: ${response.statusText}` },
          { status: response.status }
        )
      }

      const contents = await response.json()
      
      // Show directories and JSON files only
      const files = Array.isArray(contents)
        ? contents
            .filter((item: any) => item.type === "dir" || (item.type === "file" && item.name.endsWith(".json")))
            .sort((a: any, b: any) => {
              // Directories first
              if (a.type === "dir" && b.type !== "dir") return -1
              if (a.type !== "dir" && b.type === "dir") return 1
              return a.name.localeCompare(b.name)
            })
            .map((item: any) => ({
              name: item.name,
              path: item.path,
              type: item.type,
              sha: item.sha,
              size: item.size,
            }))
        : []

      return NextResponse.json({
        success: true,
        files,
        meta: { owner, repo: repoName, path, ref },
      })
    }

    // Action: fetch specific file content
    if (action === "fetch") {
      if (!path) {
        return NextResponse.json(
          { error: "Missing required parameter: path" },
          { status: 400 }
        )
      }

      headers.Accept = "application/vnd.github.v3.raw"
      const githubUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${ref}`
      
      const response = await fetch(githubUrl, { headers })

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { error: "File not found" },
            { status: 404 }
          )
        }
        return NextResponse.json(
          { error: `GitHub API error: ${response.statusText}` },
          { status: response.status }
        )
      }

      const content = await response.text()
      
      try {
        const jsonContent = JSON.parse(content)
        return NextResponse.json({
          success: true,
          content: jsonContent,
          meta: { owner, repo: repoName, path, ref },
        })
      } catch {
        return NextResponse.json(
          { error: "File is not valid JSON" },
          { status: 400 }
        )
      }
    }

    // Action: save/create file in repo
    if (action === "save") {
      if (!path) {
        return NextResponse.json(
          { error: "Missing required parameter: path" },
          { status: 400 }
        )
      }

      const { content, message = "Save workflow from SFM" } = body
      if (!content) {
        return NextResponse.json(
          { error: "Missing required parameter: content" },
          { status: 400 }
        )
      }

      if (!authToken) {
        return NextResponse.json(
          { error: "GitHub token required to save files" },
          { status: 401 }
        )
      }

      headers.Accept = "application/vnd.github.v3+json"
      
      // First, try to get the file to check if it exists (for update)
      const checkUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${ref}`
      let existingSha: string | undefined
      
      try {
        const checkResponse = await fetch(checkUrl, { headers })
        if (checkResponse.ok) {
          const existingFile = await checkResponse.json()
          existingSha = existingFile.sha
        }
      } catch {
        // File doesn't exist, that's fine
      }

      // Create or update file
      const githubUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`
      const contentBase64 = Buffer.from(JSON.stringify(content, null, 2)).toString("base64")
      
      const saveBody: any = {
        message,
        content: contentBase64,
        branch: ref,
      }
      
      if (existingSha) {
        saveBody.sha = existingSha
      }

      const response = await fetch(githubUrl, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.json(
          { error: errorData.message || `GitHub API error: ${response.statusText}` },
          { status: response.status }
        )
      }

      const result = await response.json()
      return NextResponse.json({
        success: true,
        message: existingSha ? "File updated" : "File created",
        path: result.content.path,
        sha: result.content.sha,
      })
    }

    return NextResponse.json(
      { error: "Invalid action. Use: list, fetch, save" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("GitHub API error:", error)
    return NextResponse.json(
      { error: `Failed to process request: ${error.message}` },
      { status: 500 }
    )
  }
}
