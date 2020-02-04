const normaliseRootEndpoint = (str: string) => {
    const noSlash = str.startsWith('/')
        ? str.slice(1)
        : str;
    
    return {
        noSlash,
        withSlash: `/${noSlash}`
    };
};

export {
    normaliseRootEndpoint,
};
