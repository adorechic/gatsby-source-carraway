const fetch = require("node-fetch")
const queryString = require("query-string")

const duplicateNodes = {}

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, configOptions) => {
  const { createNode, deleteNode } = actions
  delete configOptions.plugins

  const { url } = configOptions

  const res = await fetch(url).then(res => res.json())
  const posts = res.data.posts

  posts.forEach(post => {
    const duplicateNode = duplicateNodes[post.uid]

    if (duplicateNode) {
      if (post.updated > duplicateNode.updated) {
        deleteNode(duplicateNode.id, duplicateNode)
      } else {
        return
      }
    }

    const nodeId = createNodeId(`carraway-${post.uid}`)
    const node = {
      ...post,
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: `CarrawayPost`,
        contentDigest: createContentDigest(JSON.stringify(post))
      }
    }
    createNode(node)
    duplicateNodes[post.uid] = node
  })
}
