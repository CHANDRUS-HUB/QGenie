import { motion } from 'framer-motion';

function TemplatePointers() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <motion.h1
                className="sm470:text-2xl text-xl mt-5 font-bold text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                Automated Question Bank Generation
            </motion.h1>
            <motion.div
                className="mt-6 space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                            staggerChildren: 0.2,
                        },
                    },
                }}
            >
                <div className="space-y-3 text-sm sm:text-base md:text-lg lg:text-xl px-2 sm:px-4">
                    <motion.p
                        className="flex items-start sm:items-center gap-2"
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    >
                        <span className="text-green-900 font-bold text-lg">✓</span>
                        <span>
                            <span className="font-semibold">AI-driven question generation</span>{" "}
                            based on topic and difficulty
                        </span>
                    </motion.p>

                    <motion.p
                        className="flex items-start sm:items-center gap-2"
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    >
                        <span className="text-green-900 font-bold text-lg">✓</span>
                        <span>
                            <span className="font-semibold">Automated categorization of questions</span>{" "}
                            (MCQs, True/False, Short Answer)
                        </span>
                    </motion.p>

                    <motion.p
                        className="flex items-start sm:items-center gap-2"
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    >
                        <span className="text-green-900 font-bold text-lg">✓</span>
                        <span>
                            Customizable <span className="font-semibold">question banks</span>{" "}
                            with easy filtering options
                        </span>
                    </motion.p>
                </div>

            </motion.div>
        </motion.div>
    );
}

export default TemplatePointers;
