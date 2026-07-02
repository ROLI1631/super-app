# Numeric Universe API Reference

## Read-only API

### getNode(id)
Returns the node for the given numeric ID.

### getChildren(id)
Returns direct child nodes for the given numeric ID.

### getParent(id)
Returns the parent node for the given numeric ID.

### searchById(id)
Alias for `getNode(id)`.

### searchByPath(path)
Returns valid numeric IDs along the requested path.
