import { motion } from 'framer-motion';

function TemplatePointers() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <motion.h1
                className="text-2xl mt-5 font-bold text-center"
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
                <motion.p
                    className="py-2 flex items-center"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                    ✓ <span className="font-semibold ml-2">AI-driven question generation</span> based on topic and difficulty
                </motion.p>
                <motion.p
                    className="py-2 flex items-center"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                    ✓ <span className="font-semibold ml-2">Automated categorization of questions (MCQs, True/False, Short Answer) </span> 
                </motion.p>
                <motion.p
                    className="py-2 flex items-center"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                    ✓ Customizable <span className="font-semibold ml-2">question banks</span> with easy filtering options
                </motion.p>
            </motion.div>
        </motion.div>
    );
}

export default TemplatePointers;
