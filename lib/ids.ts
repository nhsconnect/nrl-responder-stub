const IdGenerator = function* (startVal: number) {
    let i = startVal;
    while (true) yield i++;
};

const IdIncrementer = (startVal: number) => {
    const idGenerator = IdGenerator(startVal);

    return () => idGenerator.next().value;
};

const globalId = IdIncrementer(1);

export {
    IdIncrementer,
    globalId,
}
