let catalogue = null;
export const set = (c) => {
    catalogue = c
}
export const get = () => {
    return catalogue
}

/*
    fbx catalogue properties [title, description, fbx.url, accessoirescompatibles, laquables, ...]
*/
export const getProps = (sku) => {
    return catalogue.find(props => props.sku === sku)
}

export const getMultipleProps = (skus) => {
    return catalogue.filter(props => (skus.length > 0 ? skus.includes(props.sku) : true))
}