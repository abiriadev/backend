export const basics = {
    id: true,
    createdAt: true,
    updatedAt: true,
}

export const excludePassword = {
    ...basics,
    name: true,
}

export const excludeContent = {
    ...basics,
    title: true,
    category: true,
}
